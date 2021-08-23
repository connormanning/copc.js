import { Binary, Getter, parseBigInt } from 'utils'

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

export async function walk(filename: string | Getter, header: Header) {
  const get = Getter.create(filename)
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

function parse(buffer: Binary, isExtended?: boolean) {
  return (isExtended ? parseExtended : parseNormal)(buffer)
}

function parseNormal(buffer: Binary): VlrWithoutOffset {
  const dv = Binary.toDataView(buffer)
  if (dv.byteLength !== vlrHeaderLength) {
    throw new Error(
      `Invalid VLR header length (must be ${vlrHeaderLength}): ${dv.byteLength}`
    )
  }

  return {
    userId: Binary.toCString(buffer.slice(2, 18)),
    recordId: dv.getUint16(18, true),
    contentLength: dv.getUint16(20, true),
    description: Binary.toCString(buffer.slice(22, 54)),
    isExtended: false,
  }
}

function parseExtended(buffer: Binary): VlrWithoutOffset {
  const dv = Binary.toDataView(buffer)
  if (dv.byteLength !== evlrHeaderLength) {
    throw new Error(
      `Invalid EVLR header length (must be ${evlrHeaderLength}): ${dv.byteLength}`
    )
  }

  return {
    userId: Binary.toCString(buffer.slice(2, 18)),
    recordId: dv.getUint16(18, true),
    contentLength: parseBigInt(dv.getBigUint64(20, true)),
    description: Binary.toCString(buffer.slice(28, 60)),
    isExtended: true,
  }
}

type DoWalk = {
  get: Getter
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
    const { userId, recordId, contentLength, description } = parse(
      buffer,
      isExtended
    )
    vlrs.push({
      userId,
      recordId,
      contentOffset: pos + length,
      contentLength,
      description,
      isExtended,
    })
    pos += length + contentLength
  }

  return vlrs
}
