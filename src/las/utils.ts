import { Binary } from 'utils'

export type Point = [number, number, number]
export function parsePoint(buffer: Binary): Point {
  const dv = Binary.toDataView(buffer)
  if (dv.byteLength !== 24) {
    throw new Error(`Invalid tuple buffer length: ${dv.byteLength}`)
  }
  return [
    dv.getFloat64(0, true),
    dv.getFloat64(8, true),
    dv.getFloat64(16, true),
  ]
}

export function formatGuid(buffer: Binary): string {
  const dv = Binary.toDataView(buffer)
  if (dv.byteLength !== 16) {
    throw new Error(`Invalid GUID buffer length: ${dv.byteLength}`)
  }

  let s = ''
  for (let i = 0; i < dv.byteLength; i += 4) {
    const c = dv.getUint32(i, true)
    s += c.toString(16).padStart(8, '0')
  }

  return [s.slice(0, 8), s.slice(8, 12), s.slice(12, 16), s.slice(16, 32)].join(
    '-'
  )
}
