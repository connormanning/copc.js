export type AnyBuffer = Uint8Array | DataView
export const AnyBuffer = { slice, toDataView, toString }

export function toDataView(buffer: AnyBuffer): DataView {
	if (buffer instanceof DataView) return buffer

  if (Buffer.isBuffer(buffer)) {
    return new DataView(buffer.buffer, buffer.byteOffset, buffer.length)
  }

	throw new Error('Invalid view')
}

export function slice(buffer: AnyBuffer, begin: number, end: number): DataView {
  return new DataView(buffer.buffer, buffer.byteOffset + begin, end - begin)
}

export function toString(buffer: AnyBuffer): string {
  const dv = toDataView(buffer)
  let s = ''
  for (let i = 0; i < dv.byteLength; ++i) {
    const c = dv.getInt8(i)
    if (c === 0) return s
    s += String.fromCharCode(c)
  }
  return s
}
