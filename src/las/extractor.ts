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
    case 6:
      return create6(header)
    case 7:
      return create7(header)
    default:
      throw new Error(`Unsupported point data record format: ${pdrf}`)
  }
}

function create6(header: PartialHeader): ExtractorType.Map {
  const { scale, offset } = header
  const getPointOffset = getPointOffsetGetter(header)
  function getReturnFlags(dv: DataView, index: number) {
    return dv.getUint8(getPointOffset(index) + 14)
  }
  function getScanFlags(dv: DataView, index: number) {
    return dv.getUint8(getPointOffset(index) + 15)
  }

  return {
    X: (dv, index) =>
      Scale.unapply(
        dv.getInt32(getPointOffset(index), true),//4
        scale[0],
        offset[0]
      ),
    Y: (dv, index) =>
      Scale.unapply(
        dv.getInt32(getPointOffset(index) + 4, true),//8
        scale[1],
        offset[1]
      ),
    Z: (dv, index) =>
      Scale.unapply(
        dv.getInt32(getPointOffset(index) + 8, true),//12
        scale[2],
        offset[2]
      ),
      Intensity: (dv, index) => dv.getUint16(getPointOffset(index) + 12, true),//14
      ReturnNumber: (dv, index) => getReturnFlags(dv, index) & 0b0000_1111, //15
      NumberOfReturns: (dv, index) =>
        (getReturnFlags(dv, index) & 0b1111_0000) >> 4, //15
      Synthetic: (dv, index) =>
        (getScanFlags(dv, index) & 0b0000_0001) >> 0,
      KeyPoint: (dv, index) =>
        (getScanFlags(dv, index) & 0b0000_0010) >> 1,
      Withheld: (dv, index) =>
        (getScanFlags(dv, index) & 0b0000_0100) >> 2,
      Overlap: (dv, index) =>
        (getScanFlags(dv, index) & 0b0000_1000) >> 3,
      ScannerChannel: (dv, index) =>
        (getScanFlags(dv, index) & 0b0011_0000) >> 4,
      ScanDirectionFlag: (dv, index) =>
        (getScanFlags(dv, index) & 0b0100_0000) >> 6,
      EdgeOfFlightLine: (dv, index) =>
        (getScanFlags(dv, index) & 0b1000_0000) >> 7, //16
      Classification: (dv, index) => dv.getUint8(getPointOffset(index) + 16),//17
      UserData: (dv, index) => dv.getUint8(getPointOffset(index) + 17),//18
      ScanAngle: (dv, index) => dv.getInt16(getPointOffset(index) + 18),//20
      PointSourceId: (dv, index) => dv.getUint16(getPointOffset(index) + 20),//22
      GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 22, true), //30
  }
}

function create7(header: PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)
  return {
    ...create6(header), 
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 30, true), //32
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 32, true), //34
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 34, true), //36
  }
}

function getPointOffsetGetter(header: PartialHeader) {
  const { pointDataRecordLength } = header
  return function getPointOffset(index: number) {
    return index * pointDataRecordLength
  }
}
