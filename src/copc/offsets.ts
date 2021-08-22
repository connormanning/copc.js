import { AnyBuffer, parseBigInt } from 'utils'

import { offsetsLength } from './constants'

export type Offsets = {
  span: number
  rootHierarchyOffset: number
  rootHierarchyLength: number
  lazVlrOffset: number
  lazVlrLength: number
  wktVlrOffset: number
  wktVlrLength: number
  extraBytesVlrOffset: number
  extraBytesVlrLength: number
}
export const Offsets = { parse }

function parse(buffer: AnyBuffer): Offsets {
	const dv = AnyBuffer.toDataView(buffer)

  if (dv.byteLength !== offsetsLength) {
    throw new Error(
      `Invalid COPC offsets length (should be ${offsetsLength}): ${dv.byteLength}`
    )
  }

  return {
    span: parseBigInt(dv.getBigInt64(0, true)),
    rootHierarchyOffset: parseBigInt(dv.getBigUint64(8, true)),
    rootHierarchyLength: parseBigInt(dv.getBigUint64(16, true)),
    lazVlrOffset: parseBigInt(dv.getBigUint64(24, true)),
    lazVlrLength: parseBigInt(dv.getBigUint64(32, true)),
    wktVlrOffset: parseBigInt(dv.getBigUint64(40, true)),
    wktVlrLength: parseBigInt(dv.getBigUint64(48, true)),
    extraBytesVlrOffset: parseBigInt(dv.getBigUint64(56, true)),
    extraBytesVlrLength: parseBigInt(dv.getBigUint64(64, true)),
  }
}
