import { Binary, parseBigInt } from 'utils'

import { offsetsLength } from './constants'

export type Offsets = {
  center_x: number
  center_y: number
  center_z: number
  halfsize: number
  spacing: number
  rootHierarchyOffset: number
  rootHierarchyLength: number
}
export const Offsets = { parse }

function parse(buffer: Binary): Offsets {
	const dv = Binary.toDataView(buffer)

  if (dv.byteLength !== offsetsLength) {
    throw new Error(
      `Invalid COPC offsets length (should be ${offsetsLength}): ${dv.byteLength}`
    )
  }

  return {
    center_x: Number(dv.getFloat64(0, true)),
    center_y: Number(dv.getFloat64(8, true)),
    center_z: Number(dv.getFloat64(16, true)),
    halfsize: Number(dv.getFloat64(24, true)),
    spacing: Number(dv.getFloat64(32, true)),
    rootHierarchyOffset: parseBigInt(dv.getBigUint64(40, true)),
    rootHierarchyLength: parseBigInt(dv.getBigUint64(48, true)),
  }
}
