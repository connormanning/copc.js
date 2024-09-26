import { Binary, Point } from 'utils'
import { View } from './view'

const X = 100
const Y = 200
const Z = 300
const Intensity = 50000
const ReturnNumber = 1
const NumberOfReturns = 2
const ScanDirectionFlag = 0
const EdgeOfFlightLine = 1
const Classification = 3
const Synthetic = 1
const KeyPoint = 0
const Withheld = 1
const Overlap = 0
const ScanAngle = 30
const UserData = 130
const PointSourceId = 65000
const GpsTime = 3.14159
const Red = 127
const Green = 33
const Blue = 240
const ScannerChannel = 2
const Infrared = 45000

const P0 = {
  X,
  Y,
  Z,
  Intensity,
  ReturnNumber,
  NumberOfReturns,
  ScanDirectionFlag,
  EdgeOfFlightLine,
  Classification,
  Synthetic,
  KeyPoint,
  Withheld,
  Overlap,
  ScanAngle,
  UserData,
  PointSourceId,
}
const P1 = { ...P0, GpsTime }
const P2 = { ...P0, Red, Green, Blue }
const P3 = { ...P1, Red, Green, Blue }
const P6 = { ...P0 }
const P7 = { ...P6, Red, Green, Blue }
const P8 = { ...P7, Infrared }

const scale: Point = [0.01, 0.01, 0.01]
const offset: Point = [500, 600, 700]

const p0 = Buffer.alloc(20)
p0.writeInt32LE((X - offset[0]) / scale[0], 0)
p0.writeInt32LE((Y - offset[1]) / scale[1], 4)
p0.writeInt32LE((Z - offset[2]) / scale[2], 8)
p0.writeUInt16LE(Intensity, 12)
p0.writeUInt8(
  ReturnNumber |
    (NumberOfReturns << 3) |
    (ScanDirectionFlag << 6) |
    (EdgeOfFlightLine << 7),
  14,
)
p0.writeUInt8(
  Classification | (Synthetic << 5) | (KeyPoint << 6) | (Withheld << 7),
  15,
)
p0.writeInt8(ScanAngle, 16)
p0.writeUInt8(UserData, 17)
p0.writeUInt16LE(PointSourceId, 18)

const p1 = Buffer.concat([p0, Buffer.alloc(8)])
p1.writeDoubleLE(GpsTime, 20)

const p2 = Buffer.concat([p0, Buffer.alloc(6)])
p2.writeUInt16LE(Red, 20)
p2.writeUInt16LE(Green, 22)
p2.writeUInt16LE(Blue, 24)

const p3 = Buffer.concat([p1, Buffer.alloc(6)])
p3.writeUInt16LE(Red, 28)
p3.writeUInt16LE(Green, 30)
p3.writeUInt16LE(Blue, 32)

const p6 = Buffer.alloc(30)
p6.writeInt32LE((X - offset[0]) / scale[0], 0)
p6.writeInt32LE((Y - offset[1]) / scale[1], 4)
p6.writeInt32LE((Z - offset[2]) / scale[2], 8)
p6.writeUInt16LE(Intensity, 12)
p6.writeUInt8(ReturnNumber | (NumberOfReturns << 4), 14)
p6.writeUInt8(
  Synthetic |
    (KeyPoint << 1) |
    (Withheld << 2) |
    (Overlap << 3) |
    (ScannerChannel << 4) |
    (ScanDirectionFlag << 6) |
    (EdgeOfFlightLine << 7),
  15,
)
p6.writeUInt8(Classification, 16)
p6.writeUInt8(UserData, 17)
p6.writeInt16LE(ScanAngle / 0.006, 18)
p6.writeUInt16LE(PointSourceId, 20)
p6.writeDoubleLE(GpsTime, 22)

const p7 = Buffer.concat([p6, Buffer.alloc(6)])
p7.writeUInt16LE(Red, 30)
p7.writeUInt16LE(Green, 32)
p7.writeUInt16LE(Blue, 34)

const p8 = Buffer.concat([p7, Buffer.alloc(2)])
p8.writeUInt16LE(Infrared, 36)

test('view', () => {
  const pointDataRecordFormat = 6
  const pointDataRecordLength = 30
  const header = {
    pointDataRecordFormat,
    pointDataRecordLength,
    scale,
    offset,
  }

  const buffer = Buffer.concat([Buffer.alloc(pointDataRecordLength * 2), p6])
  const view = View.create(buffer, header)

  expect(Object.keys(view.dimensions)).toEqual([
    'X',
    'Y',
    'Z',
    'Intensity',
    'ReturnNumber',
    'NumberOfReturns',
    'Synthetic',
    'KeyPoint',
    'Withheld',
    'Overlap',
    'ScannerChannel',
    'ScanDirectionFlag',
    'EdgeOfFlightLine',
    'Classification',
    'UserData',
    'ScanAngle',
    'PointSourceId',
    'GpsTime',
  ])

  expect(view.getter('X')(2)).toEqual(X)
  expect(view.getter('Y')(2)).toEqual(Y)
  expect(view.getter('Z')(2)).toEqual(Z)
  expect(view.getter('Intensity')(2)).toEqual(Intensity)
  expect(view.getter('GpsTime')(2)).toEqual(GpsTime)

  expect(() => view.getter('Nothing')).toThrow(/Nothing/)
  expect(() => View.create(buffer.slice(0, -1), header)).toThrow(/length/i)
  expect(() => view.getter('X')(3)).toThrow(/range/i)
})

test('include', () => {
  const pointDataRecordFormat = 6
  const pointDataRecordLength = 30
  const header = {
    pointDataRecordFormat,
    pointDataRecordLength,
    scale,
    offset,
  }

  const buffer = Buffer.concat([Buffer.alloc(pointDataRecordLength * 2), p6])
  const view = View.create(buffer, header, [], ['X', 'Y', 'Intensity'])

  expect(Object.keys(view.dimensions)).toEqual(['X', 'Y', 'Intensity'])

  expect(view.getter('X')(2)).toEqual(X)
  expect(view.getter('Y')(2)).toEqual(Y)
  expect(view.getter('Intensity')(2)).toEqual(Intensity)
  expect(() => view.getter('Z')(2)).toThrow(/Z/)
  expect(() => view.getter('GpsTime')(2)).toThrow(/GpsTime/)

  expect(() => view.getter('Nothing')).toThrow(/Nothing/)
  expect(() => View.create(buffer.slice(0, -1), header)).toThrow(/length/i)
  expect(() => view.getter('X')(3)).toThrow(/range/i)
})
