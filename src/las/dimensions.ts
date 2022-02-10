import { Dimension, Extractor } from 'utils'

import { ExtraBytes } from './extra-bytes'

export const Dimensions = { create }

const { Type } = Dimension
const typemap: { [name: string]: Dimension | undefined } = {
  X: Type.float64,
  Y: Type.float64,
  Z: Type.float64,
  Intensity: Type.uint16,
  ReturnNumber: Type.uint8,
  NumberOfReturns: Type.uint8,
  ScanDirectionFlag: Type.boolean,
  EdgeOfFlightLine: Type.boolean,
  Classification: Type.uint8,
  Synthetic: Type.boolean,
  KeyPoint: Type.boolean,
  Withheld: Type.boolean,
  Overlap: Type.boolean,
  ScanAngle: Type.float32,
  UserData: Type.uint8,
  PointSourceId: Type.uint16,
  GpsTime: Type.float64,
  Red: Type.uint16,
  Green: Type.uint16,
  Blue: Type.uint16,
  ScannerChannel: Type.uint8,
  Infrared: Type.uint16,
}
function create(extractor: Extractor.Map, eb: ExtraBytes[] = []) {
  return Object.keys(extractor).reduce<Dimension.Map>((map, name) => {
    const type = typemap[name]
    if (type) return { ...map, [name]: type }

    const e = eb.find((v) => v.name === name)
    const dimension = e && ExtraBytes.getDimension(e)
    if (dimension) return { ...map, [name]: dimension }

    throw new Error(`Failed to look up LAS type: ${name}`)
  }, {})
}
