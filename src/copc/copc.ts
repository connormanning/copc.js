import * as Las from 'las'
import { GetRange, View } from 'utils'

import { Hierarchy } from './hierarchy'
import { Key } from './key'
import { Offsets } from './offsets'

export type Copc = {
  header: Las.Header
  vlrs: Las.Vlr[]
  offsets: Offsets
  hierarchy: Hierarchy
}
export const Copc = { create, loadPointData }

/**
 * Parse the COPC header and walk VLR and EVLR metadata.
 */
async function create(get: GetRange): Promise<Copc> {
  const header = Las.Header.parse(await get(0, Las.Constants.headerLength))
  const vlrs = await Las.Vlr.walk(header, get)

  const copcVlr = vlrs.find((v) => v.userId === 'entwine' && v.recordId === 1)
  if (!copcVlr) throw new Error('COPC VLR is required')
  const { contentOffset, contentLength } = copcVlr
  const offsets = Offsets.parse(
    await get(contentOffset, contentOffset + contentLength)
  )

  const hierarchy: Hierarchy = {
    '0-0-0-0': {
      type: 'lazy',
      pageOffset: offsets.rootHierarchyOffset,
      pageLength: offsets.rootHierarchyLength,
    },
  }

  return { header, vlrs, offsets, hierarchy }
}

async function loadPointData(
  copc: Copc,
  key: Key | string,
  get: GetRange
): Promise<View> {
  // Ensure that the hierarchy entry for this node is loaded.
  const page = await Hierarchy.maybeLoad(copc.hierarchy, key, get)
  if (page) copc.hierarchy = { ...copc.hierarchy, ...page }

  // Grab the hierarchy data for this entry.
  const { [Key.toString(key)]: item } = copc.hierarchy
  if (!item || item.type !== 'page') {
    throw new Error(
      `Cannot get point data - hierarchy not loaded: ${Key.toString(key)}`
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

  return Las.View.create(copc.header, buffer)
}
