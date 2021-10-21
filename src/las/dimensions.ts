import { Dimension, Extractor } from '../utils'

export const Dimensions = { create }

const { Type } = Dimension
const typemap: { [name: string]: Dimension | undefined } = {
  X: Type.float64,
  Y: Type.float64,
  Z: Type.float64,
  Intensity: Type.uint16,
  ReturnNumber: Type.uint8,
  NumberOfReturns: Type.uint8,
  Synthetic: Type.boolean,
  KeyPoint: Type.boolean,
  Withheld: Type.boolean,
  Overlap: Type.boolean,
  ScannerChannel: Type.uint8,
  ScanDirectionFlag: Type.boolean,
  EdgeOfFlightLine: Type.boolean,
  Classification: Type.uint8,
  UserData: Type.uint8,
  ScanAngle: Type.int16,
  PointSourceId: Type.uint16,
  GpsTime: Type.float64,
  Red: Type.uint16,
  Green: Type.uint16,
  Blue: Type.uint16,
}
function create(extractor: Extractor.Map) {
  return Object.keys(extractor).reduce<Dimension.Map>((map, name) => {
    const type = typemap[name]
    if (!type) throw new Error(`Failed to look up LAS type: ${name}`)
    return { ...map, [name]: type }
  }, {})
}
