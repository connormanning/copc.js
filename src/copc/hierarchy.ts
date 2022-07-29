import { Binary, Getter, Key, getBigUint64, parseBigInt } from 'utils'

import { hierarchyItemLength } from './constants'

export declare namespace Hierarchy {
  export type Node = {
    pointCount: number
    pointDataOffset: number
    pointDataLength: number
  }
  export namespace Node {
    export type Map = Record<string, Node | undefined>
  }

  export type Page = { pageOffset: number; pageLength: number }
  export namespace Page {
    export type Map = Record<string, Page | undefined>
  }

  export type Subtree = { nodes: Node.Map; pages: Page.Map }
}

export const Hierarchy = { parse, load }

function parse(buffer: Binary): Hierarchy.Subtree {
  const dv = Binary.toDataView(buffer)
  if (dv.byteLength % hierarchyItemLength !== 0) {
    throw new Error(`Invalid hierarchy page length: ${dv.byteLength}`)
  }

  const nodes: Hierarchy.Node.Map = {}
  const pages: Hierarchy.Page.Map = {}

  for (let i = 0; i < dv.byteLength; i += hierarchyItemLength) {
    const d = dv.getInt32(i + 0, true)
    const x = dv.getInt32(i + 4, true)
    const y = dv.getInt32(i + 8, true)
    const z = dv.getInt32(i + 12, true)
    const offset = parseBigInt(getBigUint64(dv, i + 16, true))
    const length = dv.getInt32(i + 24, true)
    const pointCount = dv.getInt32(i + 28, true)

    const key = Key.toString([d, x, y, z])

    if (pointCount < -1) {
      throw new Error(`Invalid hierarchy point count at key: ${key}`)
    } else if (pointCount === -1) {
      pages[key] = {
        pageOffset: offset,
        pageLength: length,
      }
    } else {
      nodes[key] = {
        pointCount,
        pointDataOffset: offset,
        pointDataLength: length,
      }
    }
  }

  return { nodes, pages }
}

async function load(filename: string | Getter, page: Hierarchy.Page) {
  const get = Getter.create(filename)
  return parse(await get(page.pageOffset, page.pageOffset + page.pageLength))
}
