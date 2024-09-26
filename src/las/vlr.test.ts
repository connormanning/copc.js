import { Getter } from 'utils'
import { Vlr } from '.'

const header: Vlr.OffsetInfo = {
  headerLength: 50,
  vlrCount: 2,
  evlrOffset: 1000,
  evlrCount: 2,
}

const a: Vlr.WithoutOffset = {
  userId: 'A',
  recordId: 0,
  contentLength: 10,
  description: 'a',
  isExtended: false,
}
const b: Vlr.WithoutOffset = {
  userId: 'B',
  recordId: 1,
  contentLength: 20,
  description: 'b',
  isExtended: false,
}
const c: Vlr.WithoutOffset = {
  userId: 'C',
  recordId: 2,
  contentLength: 30,
  description: 'c',
  isExtended: true,
}
const d: Vlr.WithoutOffset = {
  userId: 'D',
  recordId: 3,
  contentLength: 40,
  description: 'd',
  isExtended: true,
}

const vlrs: Vlr[] = [
  { ...a, contentOffset: header.headerLength + 54 },
  { ...b, contentOffset: header.headerLength + 54 * 2 + a.contentLength },
  { ...c, contentOffset: header.evlrOffset + 60 },
  { ...d, contentOffset: header.evlrOffset + 60 * 2 + c.contentLength },
]

const head = Buffer.concat([
  Buffer.alloc(header.headerLength),
  serialize(a),
  Buffer.alloc(a.contentLength, 'a'),
  serialize(b),
  Buffer.alloc(b.contentLength, 'b'),
])
const buffer = Buffer.concat([
  head,
  Buffer.alloc(header.evlrOffset - head.length),
  serialize(c),
  Buffer.alloc(c.contentLength, 'c'),
  serialize(d),
  Buffer.alloc(d.contentLength, 'd'),
])
const getter: Getter = async (begin, end) => buffer.slice(begin, end)

function serialize({
  userId,
  recordId,
  contentLength,
  description,
  isExtended,
}: Vlr.WithoutOffset): Buffer {
  if (isExtended) {
    const b = Buffer.alloc(60)
    Buffer.from(userId).copy(b, 2)
    b.writeUInt16LE(recordId, 18)
    b.writeBigUInt64LE(BigInt(contentLength), 20)
    Buffer.from(description).copy(b, 28)
    return b
  } else {
    const b = Buffer.alloc(54)
    Buffer.from(userId).copy(b, 2)
    b.writeUInt16LE(recordId, 18)
    b.writeUInt16LE(contentLength, 20)
    Buffer.from(description).copy(b, 22)
    return b
  }
}

test('parse', () => {
  const vlr = {
    userId: 'Something',
    recordId: 42,
    contentLength: 314,
    description: 'Description',
  }

  const normal = serialize({ ...vlr, isExtended: false })
  expect(Vlr.parse(normal)).toEqual<Vlr.WithoutOffset>({
    ...vlr,
    isExtended: false,
  })

  const extended = serialize({ ...vlr, isExtended: true })
  expect(Vlr.parse(extended, true)).toEqual<Vlr.WithoutOffset>({
    ...vlr,
    isExtended: true,
  })

  expect(() => Vlr.parse(normal, true)).toThrow(/length/)
  expect(() => Vlr.parse(extended, false)).toThrow(/length/)
})

test('walk', async () => {
  expect(await Vlr.walk(getter, header)).toEqual<Vlr[]>(vlrs)
})

test('find', () => {
  expect(Vlr.find(vlrs, 'B', 1)).toEqual<Vlr>(vlrs[1])
  expect(Vlr.find(vlrs, 'C', 2)).toEqual<Vlr>(vlrs[2])
  expect(Vlr.find(vlrs, 'A', 1)).toBeUndefined()
  expect(Vlr.find(vlrs, 'B', 0)).toBeUndefined()
})

test('at', () => {
  expect(Vlr.at(vlrs, 'B', 1)).toEqual<Vlr>(vlrs[1])
  expect(Vlr.at(vlrs, 'C', 2)).toEqual<Vlr>(vlrs[2])
  expect(() => Vlr.at(vlrs, 'A', 1)).toThrow(/not found/i)
  expect(() => Vlr.at(vlrs, 'B', 0)).toThrow(/not found/i)
})

test('fetch', async () => {
  expect(await Vlr.fetch(getter, Vlr.at(vlrs, 'B', 1))).toEqual(
    Buffer.alloc(b.contentLength, 'b'),
  )
})
