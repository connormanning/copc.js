export { Binary } from './binary'
export { Bounds } from './bounds'
export { Dimension } from './dimension'
export { Extractor } from './extractor'
export { Getter } from './getter'
export { Key } from './key'
export { Point } from './point'
export { Range } from './range'
export { Scale } from './scale'
export { Step } from './step'
export { View } from './view'

export function parseBigInt(v: BigInt) {
  if (
    v > BigInt(Number.MAX_SAFE_INTEGER) ||
    v < BigInt(-Number.MAX_SAFE_INTEGER)
  ) {
    throw new Error(`Cannot convert bigint to number: ${v}`)
  }
  return Number(v)
}
