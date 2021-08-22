import { Binary, Getter, parseBigInt } from 'utils'

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

function parse(buffer: Binary): Hierarchy {
  const dv = Binary.toDataView(buffer)
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
  filename: string | Getter,
  item: Hierarchy.Lazy
): Promise<Hierarchy> {
  const get = Getter.create(filename)
  return parse(await get(item.pageOffset, item.pageOffset + item.pageLength))
}

async function maybeLoad(
  filename: string | Getter,
  hierarchy: Hierarchy,
  key: Key | string
): Promise<Hierarchy | undefined> {
  const get = Getter.create(filename)
  const { [Key.toString(key)]: item } = hierarchy

  if (!item) throw new Error(`Hierarchy item is not loaded: ${key.toString()}`)
  if (item.type === 'page') return
  if (item.type === 'lazy') return loadPage(get, item)

  throw new Error(`Invalid hierarchy item type`)
}
