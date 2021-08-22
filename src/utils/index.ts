export { Binary } from './binary'
export { Extractor } from './extractor'
export { Getter } from './getter'
export { Scale } from './scale'
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
