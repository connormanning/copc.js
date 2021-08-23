import { Extractor as ExtractorType, Scale } from 'utils'

import { Header } from './header'

export const Extractor = { create }

type PartialHeader = Pick<
  Header,
  'pointDataRecordFormat' | 'pointDataRecordLength' | 'scale' | 'offset'
>

function create(header: PartialHeader) {
  const { pointDataRecordFormat: pdrf } = header
  switch (pdrf) {
    case 0:
      return create0(header)
    case 1:
      return create1(header)
    case 2:
      return create2(header)
    case 3:
      return create3(header)
    default:
      throw new Error(`Unsupported point data record format: ${pdrf}`)
  }
}

function create0(header: PartialHeader): ExtractorType.Map {
  const { scale, offset } = header
  const getPointOffset = getPointOffsetGetter(header)
  function getScanFlags(dv: DataView, index: number) {
    return dv.getUint8(getPointOffset(index) + 14)
  }
  function getFullClassification(dv: DataView, index: number) {
    return dv.getUint8(getPointOffset(index) + 15)
  }
  function getClassification(dv: DataView, index: number) {
    return getFullClassification(dv, index) & 0b0001_1111
  }

  return {
    X: (dv, index) =>
      Scale.unapply(
        dv.getInt32(getPointOffset(index), true),
        scale[0],
        offset[0]
      ),
    Y: (dv, index) =>
      Scale.unapply(
        dv.getInt32(getPointOffset(index) + 4, true),
        scale[1],
        offset[1]
      ),
    Z: (dv, index) =>
      Scale.unapply(
        dv.getInt32(getPointOffset(index) + 8, true),
        scale[2],
        offset[2]
      ),
    Intensity: (dv, index) => dv.getUint16(getPointOffset(index) + 12, true),
    ReturnNumber: (dv, index) => getScanFlags(dv, index) & 0b0000_0111,
    NumberOfReturns: (dv, index) =>
      (getScanFlags(dv, index) & 0b0011_1000) >> 3,
    ScanDirectionFlag: (dv, index) =>
      (getScanFlags(dv, index) & 0b0100_0000) >> 6,
    EdgeOfFlightLine: (dv, index) =>
      (getScanFlags(dv, index) & 0b1000_0000) >> 7,
    Classification: (dv, index) => getClassification(dv, index),
    Synthetic: (dv, index) =>
      (getFullClassification(dv, index) & 0b0010_0000) >> 5,
    KeyPoint: (dv, index) =>
      (getFullClassification(dv, index) & 0b0100_0000) >> 6,
    Withheld: (dv, index) =>
      (getFullClassification(dv, index) & 0b1000_0000) >> 7,
    Overlap: (dv, index) => (getClassification(dv, index) === 12 ? 1 : 0),
    ScanAngle: (dv, index) => dv.getInt8(getPointOffset(index) + 16),
    UserData: (dv, index) => dv.getUint8(getPointOffset(index) + 17),
    PointSourceId: (dv, index) =>
      dv.getUint16(getPointOffset(index) + 18, true),
  }
}

function create1(header: PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)
  return {
    ...create0(header),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 20, true),
  }
}

function create2(header: PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)

  return {
    ...create0(header),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 20, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 22, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 24, true),
  }
}

function create3(header: PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)

  return {
    ...create0(header),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 20, true),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 28, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 30, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 32, true),
  }
}

function getPointOffsetGetter(header: PartialHeader) {
  const { pointDataRecordLength } = header
  return function getPointOffset(index: number) {
    return index * pointDataRecordLength
  }
}
