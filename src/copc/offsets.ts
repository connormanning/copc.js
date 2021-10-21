import { Binary, parseBigInt } from '../utils'

import { offsetsLength } from './constants'

export type Offsets = {
  span: number
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
    span: parseBigInt(dv.getBigInt64(0, true)),
    rootHierarchyOffset: parseBigInt(dv.getBigUint64(8, true)),
    rootHierarchyLength: parseBigInt(dv.getBigUint64(16, true)),
  }
}
