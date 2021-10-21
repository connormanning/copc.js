import {Binary, Getter, Key, Step, parseBigInt} from 'utils'
import { hierarchyItemLength } from './constants'

export declare namespace Hierarchy {
  export type Lazy = {
    type: 'lazy'
    pageOffset: number
    pageLength: number
  }
  export type Node = {
    type: 'node'
    pointCount: number
    pointDataOffset: number
    pointDataLength: number
  }
  export type Root = {
    type: 'root'
    pointCount: number
    pointDataOffset: number
    pointDataLength: number
    pageOffset: number
    pageLength: number
  }

  export type Item = Lazy | Node | Root
}
export type Hierarchy = { [key: string]: Hierarchy.Item | undefined }
export const Hierarchy = { parse, loadPage, maybeLoadPage, extractPage, merge }

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

    if (pointCount < -1) {
      throw new Error(`Invalid hierarchy point count at key: ${key}`)
    }

    hierarchy[key] =
      pointCount === -1
        ? { type: 'lazy', pageOffset: offset, pageLength: length }
        : {
            type: 'node',
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

async function maybeLoadPage(
  filename: string | Getter,
  hierarchy: Hierarchy,
  key: Key | string
): Promise<Hierarchy | undefined> {
  const get = Getter.create(filename)
  const { [Key.toString(key)]: item } = hierarchy

  if (!item) throw new Error(`Hierarchy item is not loaded: ${key.toString()}`)
  if (item.type === 'node' || item.type === 'root') return
  if (item.type === 'lazy') return loadPage(get, item)

  throw new Error(`Invalid hierarchy item type`)
}

function extractPage(hierarchy: Hierarchy, key: Key | string) {
  const page: Hierarchy = {}

  function walk(key: Key, isRoot = false) {
    const keystring = Key.toString(key)
    const item = hierarchy[keystring]
    if (!item) return
    page[keystring] = item

    // If our type is "node", and we're not the requested subtree root, keep
    // walking.  Otherwise we've hit a new subroot, so we're done walking.
    if (item.type === 'node' || isRoot) {
      for (let i = 0; i < 8; ++i) {
        walk(Key.step(key, Step.fromIndex(i)))
      }
    }
  }

  walk(Key.create(key), true)

  return page
}

function merge(
  hierarchy: Hierarchy,
  key: Key | string,
  page: Hierarchy | undefined
): Hierarchy {
  if (!page) return hierarchy

  const keystring = Key.toString(key)
  // First, grab our subroot key in our existing hierarchy.  Under normal
  // circumstances, we expect it to be of type "lazy", since we are merging in
  // its page right now.
  const { [keystring]: lazy, ...hierarchyrest } = hierarchy
  if (!lazy) {
    throw new Error(`Invalid hierarchy state - missing subroot: ${keystring}`)
  }
  if (lazy.type === 'node') {
    throw new Error(`Invalid hierarchy state - node mismatch: ${keystring}`)
  }
  if (lazy.type === 'root') {
    return hierarchy
  }

  const { [keystring]: pageroot, ...pagerest } = page
  if (!pageroot) {
    throw new Error(`Invalid hierarchy page - missing subroot: ${keystring}`)
  }
  if (pageroot.type !== 'node') {
    throw new Error(`Invalid hierarchy page - invalid subroot: ${keystring}`)
  }

  const root: Hierarchy.Root = {
    type: 'root',
    pageOffset: lazy.pageOffset,
    pageLength: lazy.pageLength,
    pointCount: pageroot.pointCount,
    pointDataOffset: pageroot.pointDataOffset,
    pointDataLength: pageroot.pointDataLength,
  }

  return { ...hierarchyrest, [keystring]: root, ...pagerest }
}
