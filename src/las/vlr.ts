import { Binary, Getter, parseBigInt } from 'utils'

import { Header } from './header'
import { evlrHeaderLength, minHeaderLength, vlrHeaderLength } from './constants'

export type Vlr = {
  userId: string
  recordId: number
  contentOffset: number
  contentLength: number
  description: string
  isExtended: boolean
}
export declare namespace Vlr {
  export type WithoutOffset = Omit<Vlr, 'contentOffset'>
  export type OffsetInfo = Pick<
    Header,
    'headerLength' | 'vlrCount' | 'evlrOffset' | 'evlrCount'
  >
}
export const Vlr = { walk, parse, find, at, fetch }

function find(vlrs: Vlr[], userId: string, recordId: number) {
  return vlrs.find((v) => v.userId === userId && v.recordId === recordId)
}

function at(vlrs: Vlr[], userId: string, recordId: number) {
  const vlr = find(vlrs, userId, recordId)
  if (!vlr) throw new Error(`VLR not found: ${userId}/${recordId}`)
  return vlr
}

function fetch(
  filename: string | Getter,
  { contentOffset, contentLength }: Vlr
) {
  const get = Getter.create(filename)
  return get(contentOffset, contentOffset + contentLength)
}

async function walk(filename: string | Getter, header: Vlr.OffsetInfo) {
  const get = Getter.create(filename)
  const vlrs = await doWalk({
    get,
    startOffset: header.headerLength,
    count: header.vlrCount,
    isExtended: false,
  })
  const evlrs = await doWalk({
    get,
    startOffset: header.evlrOffset,
    count: header.evlrCount,
    isExtended: true,
  })
  return [...vlrs, ...evlrs]
}

function parse(buffer: Binary, isExtended?: boolean) {
  return (isExtended ? parseExtended : parseNormal)(buffer)
}

function parseNormal(buffer: Binary): Vlr.WithoutOffset {
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

function parseExtended(buffer: Binary): Vlr.WithoutOffset {
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
