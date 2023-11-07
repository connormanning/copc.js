export function parseBigInt(v: bigint) {
  if (
    v > BigInt(Number.MAX_SAFE_INTEGER) ||
    v < BigInt(-Number.MAX_SAFE_INTEGER)
  ) {
    throw new Error(`Cannot convert bigint to number: ${v}`)
  }
  return Number(v)
}

// Safari is non-conforming here and doesn't have the BigUint functions on their
// DataView :\
export function getBigUint64(
  dv: DataView,
  byteOffset: number,
  littleEndian?: boolean
) {
	if (dv.getBigUint64) return dv.getBigUint64(byteOffset, littleEndian)

	const [h, l] = littleEndian ? [4, 0] : [0, 4]
	const wh = BigInt(dv.getUint32(byteOffset + h, littleEndian))
	const wl = BigInt(dv.getUint32(byteOffset + l, littleEndian))
	return (wh << BigInt(32)) + wl
}
