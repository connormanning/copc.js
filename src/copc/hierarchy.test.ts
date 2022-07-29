import { Key } from 'utils'

import { Hierarchy } from './hierarchy'

type Pack = {
  key: Key
  pointCount: number
  pointDataOffset: number
  pointDataLength: number
}
function pack({ key, pointCount, pointDataOffset, pointDataLength }: Pack) {
  const buffer = Buffer.alloc(32)
  buffer.writeInt32LE(key[0], 0)
  buffer.writeInt32LE(key[1], 4)
  buffer.writeInt32LE(key[2], 8)
  buffer.writeInt32LE(key[3], 12)
  buffer.writeBigUInt64LE(BigInt(pointDataOffset), 16)
  buffer.writeInt32LE(pointDataLength, 24)
  buffer.writeInt32LE(pointCount, 28)
  return buffer
}

test('parse one', () => {
  const key: Key = [1, 0, 0, 1]
  const pointCount = 42
  const pointDataOffset = 1000
  const pointDataLength = 500
  const buffer = pack({ key, pointCount, pointDataOffset, pointDataLength })

  const h = Hierarchy.parse(buffer)
  expect(h).toEqual<Hierarchy.Subtree>({
    pages: {},
    nodes: {
      [Key.toString(key)]: { pointCount, pointDataOffset, pointDataLength },
    },
  })
})

test('parse multiple', () => {
  const a: Pack = {
    key: [1, 1, 1, 1],
    pointCount: 1,
    pointDataOffset: 100,
    pointDataLength: 101,
  }
  const b: Pack = {
    key: [2, 2, 2, 2],
    pointCount: 2,
    pointDataOffset: 200,
    pointDataLength: 201,
  }
  // When point count is -1, instead of pointDataOffset/pointDataLength, we
  // expect to get pageOffset/pageLength indicating a lazy hierarchy chunk.
  const c: Pack = {
    key: [3, 3, 3, 3],
    pointCount: -1,
    pointDataOffset: 200,
    pointDataLength: 201,
  }
  const buffer = Buffer.concat([pack(a), pack(b), pack(c)])
  const { nodes, pages } = Hierarchy.parse(buffer)

  expect(nodes).toEqual<Hierarchy.Node.Map>({
    [Key.toString(a.key)]: {
      pointCount: a.pointCount,
      pointDataOffset: a.pointDataOffset,
      pointDataLength: a.pointDataLength,
    },
    [Key.toString(b.key)]: {
      pointCount: b.pointCount,
      pointDataOffset: b.pointDataOffset,
      pointDataLength: b.pointDataLength,
    },
  })

  expect(pages).toEqual<Hierarchy.Page.Map>({
    [Key.toString(c.key)]: {
      pageOffset: b.pointDataOffset,
      pageLength: b.pointDataLength,
    },
  })
})

test('parse invalid', () => {
  const key: Key = [1, 0, 0, 1]
  const pointDataOffset = 1000
  const pointDataLength = 500

  const a = pack({ key, pointCount: -2, pointDataOffset, pointDataLength })
  expect(() => Hierarchy.parse(a)).toThrow(/point count/i)

  const b = pack({ key, pointCount: 1, pointDataOffset, pointDataLength })
  expect(() => Hierarchy.parse(Buffer.concat([b, Buffer.alloc(1)]))).toThrow(
    /length/i
  )
  expect(() => Hierarchy.parse(b.slice(0, -1))).toThrow(/length/i)
})
