export type Binary = Uint8Array
export const Binary = { toDataView, toCString }

export function toDataView(buffer: Binary): DataView {
  return new DataView(buffer.buffer, buffer.byteOffset, buffer.length)
}

export function toCString(buffer: Binary): string {
  const dv = toDataView(buffer)
  let s = ''
  for (let i = 0; i < dv.byteLength; ++i) {
    const c = dv.getInt8(i)
    if (c === 0) return s
    s += String.fromCharCode(c)
  }
  return s
}
