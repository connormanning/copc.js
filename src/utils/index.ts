export { Binary } from './binary'
export { Extractor } from './extractor'
export { Scale } from './scale'
export { View } from './view'

export type GetRange = (begin: number, end: number) => Promise<Uint8Array>

export function parseBigInt(v: BigInt) {
  if (
    v > BigInt(Number.MAX_SAFE_INTEGER) ||
    v < BigInt(-Number.MAX_SAFE_INTEGER)
  ) {
    throw new Error(`Cannot convert bigint to number: ${v}`)
  }
  return Number(v)
}
