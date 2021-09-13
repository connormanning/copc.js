import { Binary, parseBigInt } from '../utils'

import { headerLength } from './constants'
import { Point, formatGuid, parsePoint } from './utils'

export declare namespace Header {}
export type Header = {
  fileSignature: 'LASF'
  fileSourceId: number
  globalEncoding: number
  projectId: string
  majorVersion: number
  minorVersion: number
  systemIdentifier: string
  generatingSoftware: string
  fileCreationDayOfYear: number
  fileCreationYear: number
  headerLength: number
  pointDataOffset: number
  vlrCount: number
  pointDataRecordFormat: number
  pointDataRecordLength: number
  pointCount: number
  pointCountByReturn: number[]
  scale: Point
  offset: Point
  min: Point
  max: Point
  waveformDataOffset: number
  evlrOffset: number
  evlrCount: number
}
export const Header = { parse }

function parse(buffer: Binary): Header {
  const dv = Binary.toDataView(buffer)
  if (dv.byteLength !== headerLength) {
    throw new Error(
      `Invalid header length (should be ${headerLength}): ${dv.byteLength}`
    )
  }

  const fileSignature = Binary.toCString(buffer.slice(0, 4))
  if (fileSignature !== 'LASF') {
    throw new Error(`Invalid file signature: ${fileSignature}`)
  }

  const majorVersion = dv.getUint8(24)
  const minorVersion = dv.getUint8(25)
  if (majorVersion !== 1 || minorVersion !== 4) {
    throw new Error(
      `Invalid version (only 1.4 supported): ${majorVersion}.${minorVersion}`
    )
  }

  return {
    fileSignature,
    fileSourceId: dv.getUint16(4, true),
    globalEncoding: dv.getUint16(6, true),
    projectId: formatGuid(buffer.slice(8, 24)),
    majorVersion,
    minorVersion,
    systemIdentifier: Binary.toCString(buffer.slice(26, 58)),
    generatingSoftware: Binary.toCString(buffer.slice(58, 90)),
    fileCreationDayOfYear: dv.getUint16(90, true),
    fileCreationYear: dv.getUint16(92, true),
    headerLength: dv.getUint16(94, true),
    pointDataOffset: dv.getUint32(96, true),
    vlrCount: dv.getUint32(100, true),
    pointDataRecordFormat: dv.getUint8(104) & 0b1111,
    pointDataRecordLength: dv.getUint16(105, true),
    pointCount: parseBigInt(dv.getBigUint64(247, true)),
    pointCountByReturn: parseNumberOfPointsByReturn(buffer.slice(255, 375)),
    scale: parsePoint(buffer.slice(131, 155)),
    offset: parsePoint(buffer.slice(155, 179)),
    min: [
      dv.getFloat64(187, true),
      dv.getFloat64(203, true),
      dv.getFloat64(219, true),
    ],
    max: [
      dv.getFloat64(179, true),
      dv.getFloat64(195, true),
      dv.getFloat64(211, true),
    ],
    waveformDataOffset: parseBigInt(dv.getBigUint64(227, true)),
    evlrOffset: parseBigInt(dv.getBigUint64(235, true)),
    evlrCount: dv.getUint32(243, true),
  }
}

function parseNumberOfPointsByReturn(buffer: Binary): number[] {
  const dv = Binary.toDataView(buffer)
  const bigs: BigInt[] = []
  for (let offset = 0; offset < 15 * 8; offset += 8) {
    bigs.push(dv.getBigUint64(offset, true))
  }
  return bigs.map((v) => parseBigInt(v))
}
