import {
  Extractor as ExtractorType,
  Scale,
  getBigUint64,
  parseBigInt,
} from '../utils'

import { ExtraBytes } from './extra-bytes'
import { Header } from './header'

export declare namespace Extractor {
  export type Map = ExtractorType.Map
  export type PartialHeader = Pick<
    Header,
    'pointDataRecordFormat' | 'pointDataRecordLength' | 'scale' | 'offset'
  >
}
export const Extractor = { create }

// Get point data record length excluding extra bytes.
function getBasePointLength(pdrf: number): number {
  switch (pdrf) {
    case 0:
      return 20
    case 1:
      return 28
    case 2:
      return 26
    case 3:
      return 34
    case 6:
      return 30
    case 7:
      return 36
    case 8:
      return 38
    default:
      throw new Error(`Unsupported point data record format: ${pdrf}`)
  }
}

// Create an extractor for an extra-bytes field ignoring scale/offset.
function createAbsoluteExtraBytesExtractor(
  header: Extractor.PartialHeader,
  offset: number, // Offset within the point, so should be >= the base pdrf size.
  { type, length }: ExtraBytes
): ExtractorType | undefined {
  const getPointOffset = getPointOffsetGetter(header)

  switch (type) {
    case 'signed':
      switch (length) {
        case 1:
          return (dv, index) => dv.getInt8(getPointOffset(index) + offset)
        case 2:
          return (dv, index) =>
            dv.getInt16(getPointOffset(index) + offset, true)
        case 4:
          return (dv, index) =>
            dv.getInt32(getPointOffset(index) + offset, true)
        case 8:
          return (dv, index) =>
            parseBigInt(dv.getBigInt64(getPointOffset(index) + offset, true))
      }
    case 'unsigned':
      switch (length) {
        case 1:
          return (dv, index) => dv.getUint8(getPointOffset(index) + offset)
        case 2:
          return (dv, index) =>
            dv.getUint16(getPointOffset(index) + offset, true)
        case 4:
          return (dv, index) =>
            dv.getUint32(getPointOffset(index) + offset, true)
        case 8:
          return (dv, index) =>
            parseBigInt(getBigUint64(dv, getPointOffset(index) + offset, true))
      }
    case 'float':
      switch (length) {
        case 4:
          return (dv, index) =>
            dv.getFloat32(getPointOffset(index) + offset, true)
        case 8:
          return (dv, index) =>
            dv.getFloat64(getPointOffset(index) + offset, true)
      }
  }
}

function createExtras(header: Extractor.PartialHeader, eb: ExtraBytes[]) {
  const basePointLength = getBasePointLength(header.pointDataRecordFormat)
  let position = basePointLength

  return eb.reduce<ExtractorType.Map>((map, v) => {
    const offset = position
    position += v.length

    const absoluteExtractor = createAbsoluteExtraBytesExtractor(
      header,
      offset,
      v
    )

    if (!absoluteExtractor) return map

    const extractor: ExtractorType = (dv, index) =>
      Scale.unapply(absoluteExtractor(dv, index), v.scale, v.offset)

    return { ...map, [v.name]: extractor }
  }, {})
}

function create(header: Extractor.PartialHeader, eb: ExtraBytes[] = []) {
  const extras = createExtras(header, eb)

  const core = (() => {
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
      case 6:
        return create6(header)
      case 7:
        return create7(header)
      case 8:
        return create8(header)
      default:
        throw new Error(`Unsupported point data record format: ${pdrf}`)
    }
  })()
  return { ...core, ...extras }
}

function create0(header: Extractor.PartialHeader): ExtractorType.Map {
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
    Classification: (dv, index) => {
      // We extract out Overlap as a separate dimension.  In PDRFs > 6, it has
      // its own flag separate from Classification.  But here, it is signified
      // by Classification = 12.  In that case, we'll set our Overlap dimension
      // to 1, and set our Classification to 0.
      const classification = getClassification(dv, index)
      return classification === 12 ? 0 : classification
    },
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

function create1(header: Extractor.PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)
  return {
    ...create0(header),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 20, true),
  }
}

function create2(header: Extractor.PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)

  return {
    ...create0(header),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 20, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 22, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 24, true),
  }
}

function create3(header: Extractor.PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)

  return {
    ...create0(header),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 20, true),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 28, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 30, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 32, true),
  }
}

function create6(header: Extractor.PartialHeader): ExtractorType.Map {
  const { scale, offset } = header
  const getPointOffset = getPointOffsetGetter(header)
  function getFlags(dv: DataView, index: number) {
    return dv.getUint8(getPointOffset(index) + 15)
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
    ReturnNumber: (dv, index) =>
      dv.getUint16(getPointOffset(index) + 14, true) & 0b0000_1111,
    NumberOfReturns: (dv, index) =>
      (dv.getUint16(getPointOffset(index) + 14, true) & 0b1111_0000) >> 4,
    Synthetic: (dv, index) => getFlags(dv, index) & 0b0000_0001,
    KeyPoint: (dv, index) => (getFlags(dv, index) & 0b0000_0010) >> 1,
    Withheld: (dv, index) => (getFlags(dv, index) & 0b0000_0100) >> 2,
    Overlap: (dv, index) => (getFlags(dv, index) & 0b0000_1000) >> 3,
    ScannerChannel: (dv, index) => (getFlags(dv, index) & 0b0011_0000) >> 4,
    ScanDirectionFlag: (dv, index) => (getFlags(dv, index) & 0b0100_0000) >> 6,
    EdgeOfFlightLine: (dv, index) => (getFlags(dv, index) & 0b1000_0000) >> 7,
    Classification: (dv, index) => dv.getUint8(getPointOffset(index) + 16),
    UserData: (dv, index) => dv.getUint8(getPointOffset(index) + 17),
    ScanAngle: (dv, index) =>
      dv.getInt16(getPointOffset(index) + 18, true) * 0.006,
    PointSourceId: (dv, index) =>
      dv.getUint16(getPointOffset(index) + 20, true),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 22, true),
  }
}

function create7(header: Extractor.PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)
  return {
    ...create6(header),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 30, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 32, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 34, true),
  }
}

function create8(header: Extractor.PartialHeader): ExtractorType.Map {
  const getPointOffset = getPointOffsetGetter(header)
  return {
    ...create7(header),
    Infrared: (dv, index) => dv.getUint16(getPointOffset(index) + 36, true),
  }
}

function getPointOffsetGetter(header: Extractor.PartialHeader) {
  const { pointDataRecordLength } = header
  return function getPointOffset(index: number) {
    return index * pointDataRecordLength
  }
}
