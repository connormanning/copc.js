import { AnyBuffer, GetRange, parseBigInt } from 'utils'

import { Header } from './header'
import { evlrHeaderLength, headerLength, vlrHeaderLength } from './constants'

export declare namespace Vlr {}
export type Vlr = {
  userId: string
  recordId: number
  contentOffset: number
  contentLength: number
  description: string
  isExtended: boolean
}
type VlrWithoutOffset = Omit<Vlr, 'contentOffset'>
export const Vlr = { walk, parse }

export async function walk(header: Header, get: GetRange) {
  return [
    ...(await doWalk({
      get,
      startOffset: headerLength,
      count: header.vlrCount,
      isExtended: false,
    })),
    ...(await doWalk({
      get,
      startOffset: header.evlrOffset,
      count: header.evlrCount,
      isExtended: true,
    })),
  ]
}

function parse(buffer: AnyBuffer, isExtended?: boolean) {
  return (isExtended ? parseExtended : parseNormal)(buffer)
}

function parseNormal(buffer: AnyBuffer): VlrWithoutOffset {
  const dv = AnyBuffer.toDataView(buffer)
  if (dv.byteLength !== vlrHeaderLength) {
    throw new Error(
      `Invalid VLR header length (must be ${vlrHeaderLength}): ${dv.byteLength}`
    )
  }

  return {
    userId: AnyBuffer.toString(AnyBuffer.slice(dv, 2, 18)),
    recordId: dv.getUint16(18, true),
    contentLength: dv.getUint16(20, true),
    description: AnyBuffer.toString(AnyBuffer.slice(dv, 22, 54)),
    isExtended: false,
  }
}

function parseExtended(buffer: AnyBuffer): VlrWithoutOffset {
  const dv = AnyBuffer.toDataView(buffer)
  if (dv.byteLength !== evlrHeaderLength) {
    throw new Error(
      `Invalid EVLR header length (must be ${evlrHeaderLength}): ${dv.byteLength}`
    )
  }

  return {
    userId: AnyBuffer.toString(AnyBuffer.slice(dv, 2, 18)),
    recordId: dv.getUint16(18, true),
    contentLength: parseBigInt(dv.getBigUint64(20, true)),
    description: AnyBuffer.toString(AnyBuffer.slice(dv, 28, 60)),
    isExtended: true,
  }
}

type DoWalk = {
  get: GetRange
  startOffset: number
  count: number
  isExtended: boolean
}
async function doWalk({ get, startOffset, count, isExtended }: DoWalk) {
  const vlrs: Vlr[] = []
  let pos = startOffset

  const length = isExtended ? evlrHeaderLength : vlrHeaderLength

  for (let i = 0; i < count; ++i) {
    const buffer = await get(pos, pos + length)
    const vlr = parse(buffer, isExtended)
    vlrs.push({ ...vlr, contentOffset: pos + length })
    pos += length + vlr.contentLength
  }

  return vlrs
}
