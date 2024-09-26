import { parsePoint, formatGuid } from './utils'

test('parse point', () => {
  const x = -42
  const y = 3.14
  const z = 2.718
  const b = Buffer.alloc(24)
  b.writeDoubleLE(x, 0)
  b.writeDoubleLE(y, 8)
  b.writeDoubleLE(z, 16)
  expect(parsePoint(b)).toEqual([x, y, z])

  expect(() => parsePoint(Buffer.alloc(0))).toThrow(/length/i)
  expect(() => parsePoint(Buffer.concat([b, Buffer.alloc(1)]))).toThrow(
    /length/i,
  )
})

test('format guid', () => {
  expect(formatGuid(Buffer.alloc(16))).toEqual(
    '00000000-0000-0000-0000000000000000',
  )

  const b = Buffer.alloc(16)
  b.writeUInt32LE(0x01234567, 0)
  b.writeUInt32LE(0x89abcdef, 4)
  b.writeUInt32LE(0x01234567, 8)
  b.writeUInt32LE(0x89abcdef, 12)
  expect(formatGuid(b)).toEqual('01234567-89ab-cdef-0123456789abcdef')

  expect(() => formatGuid(Buffer.alloc(0))).toThrow(/length/i)
  expect(() => formatGuid(Buffer.alloc(17))).toThrow(/length/i)
})
