import { Point } from 'utils'

import { Header } from '.'

test('header', () => {
  const fileSignature = 'LASF'
  const fileSourceId = 0
  const globalEncoding = 16
  const projectId = '00000000-0000-0000-0000000000000000'
  const majorVersion = 1
  const minorVersion = 4
  const systemIdentifier = 'System identifier'
  const generatingSoftware = 'Generating software'
  const fileCreationDayOfYear = 42
  const fileCreationYear = 1970
  const headerLength = 375
  const pointDataOffset = headerLength
  const vlrCount = 2
  const pointDataRecordFormat = 6
  const pointDataRecordLength = 50
  const legacyPointCount = 555 // Ignored, non-legacy version will be used.
  const legacyPointCountByReturn = [1, 2, 3, 4, 5] // Also ignored.
  const scale: Point = [0.1, 0.01, 0.001]
  const offset: Point = [100, 200, 300]
  const min: Point = [1, 2, 3]
  const max: Point = [4, 5, 6]
  const waveformDataOffset = 400
  const evlrOffset = 500
  const evlrCount = 4
  const pointCount = 314
  const pointCountByReturn = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

  const b = Buffer.alloc(headerLength)

  Buffer.from(fileSignature).copy(b)
  b.writeUInt16LE(fileSourceId, 4)
  b.writeUInt16LE(globalEncoding, 6)
  b.fill(0, 8, 24)
  b.writeUInt8(majorVersion, 24)
  b.writeUInt8(minorVersion, 25)
  Buffer.from(systemIdentifier).copy(b, 26)
  Buffer.from(generatingSoftware).copy(b, 58)
  b.writeUInt16LE(fileCreationDayOfYear, 90)
  b.writeUInt16LE(fileCreationYear, 92)
  b.writeUInt16LE(headerLength, 94)
  b.writeUInt32LE(pointDataOffset, 96)
  b.writeUInt32LE(vlrCount, 100)
  b.writeUInt8(pointDataRecordFormat, 104)
  b.writeUInt16LE(pointDataRecordLength, 105)
  b.writeUInt32LE(legacyPointCount, 107)
  let o = 111
  for (const v of legacyPointCountByReturn) {
    b.writeUInt32LE(v, o)
    o += 4
  }
  b.writeDoubleLE(scale[0], 131)
  b.writeDoubleLE(scale[1], 139)
  b.writeDoubleLE(scale[2], 147)
  b.writeDoubleLE(offset[0], 155)
  b.writeDoubleLE(offset[1], 163)
  b.writeDoubleLE(offset[2], 171)
  b.writeDoubleLE(max[0], 179)
  b.writeDoubleLE(min[0], 187)
  b.writeDoubleLE(max[1], 195)
  b.writeDoubleLE(min[1], 203)
  b.writeDoubleLE(max[2], 211)
  b.writeDoubleLE(min[2], 219)
  b.writeBigUInt64LE(BigInt(waveformDataOffset), 227)
  b.writeBigUInt64LE(BigInt(evlrOffset), 235)
  b.writeUInt32LE(evlrCount, 243)
  b.writeBigUInt64LE(BigInt(pointCount), 247)
  o = 255
  for (const v of pointCountByReturn) {
    b.writeBigUInt64LE(BigInt(v), o)
    o += 8
  }

  expect(Header.parse(b)).toEqual<Header>({
    fileSignature,
    fileSourceId,
    globalEncoding,
    projectId,
    majorVersion,
    minorVersion,
    systemIdentifier,
    generatingSoftware,
    fileCreationDayOfYear,
    fileCreationYear,
    headerLength,
    pointDataOffset,
    vlrCount,
    pointDataRecordFormat,
    pointDataRecordLength,
    pointCount,
    pointCountByReturn,
    scale,
    offset,
    min,
    max,
    waveformDataOffset,
    evlrOffset,
    evlrCount,
  })

  const invalidFileSignature = Buffer.from(b)
  Buffer.from('ABCD').copy(invalidFileSignature, 0)
  expect(() => Header.parse(invalidFileSignature)).toThrow(/file signature/i)

  const invalidMinorVersion = Buffer.from(b)
  invalidMinorVersion.writeUInt8(3, 25)
  expect(() => Header.parse(invalidMinorVersion)).toThrow(/version/i)

  const tooShort = b.slice(0, -1)
  expect(() => Header.parse(tooShort)).toThrow(/bytes/i)
})
