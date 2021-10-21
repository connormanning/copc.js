import * as Las from '../las'
import { Getter, View, Binary } from '../utils'

import { Hierarchy } from './hierarchy'
import { Key } from './key'
import { Offsets } from './offsets'
import { Extents } from './extents'

export type Copc = {
  header: Las.Header
  vlrs: Las.Vlr[]
  offsets: Offsets
  hierarchy: Hierarchy
  extents: Object
}
export const Copc = { create, loadPointData, loadPointDataView, loadHierarchyPage }

/**
 * Parse the COPC header and walk VLR and EVLR metadata.
 */
async function create(filename: string | Getter): Promise<Copc> {
  const get = Getter.create(filename)
  const header = Las.Header.parse(await get(0, Las.Constants.headerLength))
  const vlrs = await Las.Vlr.walk(get, header)

  const copcVlr = vlrs.find((v) => v.userId === 'copc' && v.recordId === 1)
  if (!copcVlr) throw new Error('COPC VLR is required')
  const { contentOffset, contentLength } = copcVlr
  const offsets = Offsets.parse(
    await get(contentOffset, contentOffset + contentLength)
  )

  const extentsVlr = vlrs.find((v) => v.userId === 'copc' && v.recordId === 10000)
  if (!extentsVlr) throw new Error('Extents VLR is required')
  const extents = Extents.parse( header,
    await get(extentsVlr.contentOffset, extentsVlr.contentOffset + extentsVlr.contentLength)
  )

  const hierarchy: Hierarchy = {
    '0-0-0-0': {
      type: 'lazy',
      pageOffset: offsets.rootHierarchyOffset,
      pageLength: offsets.rootHierarchyLength,
    },
  }

  return { header, vlrs, offsets, hierarchy, extents }
}

async function loadHierarchyPage(
  filename: string | Getter,
  copc: Copc,
  key: Key | string = '0-0-0-0'
) {
  const get = Getter.create(filename)
  const keystring = Key.toString(key)
  const { [keystring]: item } = copc.hierarchy
  if (!item || item.type !== 'lazy') {
    throw new Error(`Invalid hierarchy load request for key ${keystring}`)
  }
  return Hierarchy.loadPage(get, item)
}

async function loadPointData(
  filename: string | Getter,
  copc: Copc,
  key: Key | string
): Promise<Binary> {
  const get = Getter.create(filename)

  // Ensure that the hierarchy entry for this node is loaded.
  const page = await Hierarchy.maybeLoadPage(get, copc.hierarchy, key)
  if (page) copc.hierarchy = { ...copc.hierarchy, ...page }

  // Grab the hierarchy data for this entry.
  const keystring = Key.toString(key)
  const { [keystring]: item } = copc.hierarchy
  if (!item || item.type !== 'node') {
    throw new Error(
      `Cannot get point data - hierarchy not loaded: ${keystring}`
    )
  }

  // Now fetch, decompress, and create a view over the point data.
  const { pointDataRecordFormat, pointDataRecordLength } = copc.header
  const { pointCount, pointDataOffset, pointDataLength } = item

  const compressed = await get(
    pointDataOffset,
    pointDataOffset + pointDataLength
  )
  const buffer = await Las.PointData.decompress(compressed, {
    pointDataRecordFormat,
    pointDataRecordLength,
    pointCount,
  })

  return buffer
}

async function loadPointDataView(
  filename: string | Getter,
  copc: Copc,
  key: Key | string
): Promise<View> {
  return Las.View.create(copc.header, (await loadPointData(filename, copc, key)));
}