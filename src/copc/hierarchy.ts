import { AnyBuffer, GetRange, parseBigInt } from 'utils'

import { hierarchyItemLength } from './constants'
import { Key } from './key'

export declare namespace Hierarchy {
  export type Lazy = {
    type: 'lazy'
    pageOffset: number
    pageLength: number
  }
  export type Page = {
    type: 'page'
    pointCount: number
    pointDataOffset: number
    pointDataLength: number
  }

  export type Item = Lazy | Page
}
export type Hierarchy = { [key: string]: Hierarchy.Item | undefined }
export const Hierarchy = { parse, maybeLoad, loadPage }

function parse(buffer: AnyBuffer): Hierarchy {
  const dv = AnyBuffer.toDataView(buffer)
  if (dv.byteLength % hierarchyItemLength !== 0) {
    throw new Error(`Invalid hierarchy page length: ${dv.byteLength}`)
  }
  const hierarchy: Hierarchy = {}

  for (let i = 0; i < dv.byteLength; i += hierarchyItemLength) {
    const d = dv.getInt32(i + 0, true)
    const x = dv.getInt32(i + 4, true)
    const y = dv.getInt32(i + 8, true)
    const z = dv.getInt32(i + 12, true)
    const offset = parseBigInt(dv.getBigUint64(i + 16, true))
    const length = dv.getInt32(i + 24, true)
    const pointCount = dv.getInt32(i + 28, true)

    const key = Key.toString([d, x, y, z])

    hierarchy[key] =
      pointCount === -1
        ? { type: 'lazy', pageOffset: offset, pageLength: length }
        : {
            type: 'page',
            pointCount,
            pointDataOffset: offset,
            pointDataLength: length,
          }
  }

  return hierarchy
}

async function loadPage(
  item: Hierarchy.Lazy,
  get: GetRange
): Promise<Hierarchy> {
  return parse(await get(item.pageOffset, item.pageOffset + item.pageLength))
}

async function maybeLoad(
  hierarchy: Hierarchy,
  key: Key | string,
  get: GetRange
): Promise<Hierarchy | undefined> {
  const { [Key.toString(key)]: item } = hierarchy

  if (!item) throw new Error(`Hierarchy item is not loaded: ${key.toString()}`)
  if (item.type === 'page') return
  if (item.type === 'lazy') return loadPage(item, get)

  throw new Error(`Invalid hierarchy item type`)
}
