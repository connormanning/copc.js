import { Binary, Dimension, parseBigInt } from 'utils'

export namespace ExtraBytes {
  export type Options = {
    hasNodata: boolean
    hasMin: boolean
    hasMax: boolean
    hasScale: boolean
    hasOffset: boolean
  }
}
export type ExtraBytes = {
  name: string
  description: string
  type?: Dimension.Type
  length: number
  nodata?: number
  min?: number
  max?: number
  scale?: number
  offset?: number
}
export const ExtraBytes = { getDimension, parse, parseOne }

const entryLength = 192

function getDimension({
  type,
  length: size,
}: ExtraBytes): Dimension | undefined {
  switch (type) {
    case 'signed':
    case 'unsigned':
      switch (size) {
        case 1:
        case 2:
        case 4:
        case 8:
          return { type, size }
      }
    case 'float':
      switch (size) {
        case 4:
        case 8:
          return { type, size }
      }
  }
}

function parse(buffer: Binary): ExtraBytes[] {
  if (buffer.byteLength % entryLength !== 0) {
    throw new Error(`Invalid extra bytes VLR length: ${buffer.byteLength}`)
  }
  const result: ExtraBytes[] = []
  for (let offset = 0; offset < buffer.byteLength; offset += entryLength) {
    result.push(parseOne(buffer.slice(offset, offset + entryLength)))
  }
  return result
}

function parseOne(buffer: Binary): ExtraBytes {
  if (buffer.byteLength !== entryLength) {
    throw new Error(`Invalid extra bytes entry length: ${buffer.byteLength}`)
  }

  const dv = Binary.toDataView(buffer)

  const name = Binary.toCString(buffer.slice(4, 36))
  const description = Binary.toCString(buffer.slice(60, 192))
  const rawtype = dv.getUint8(2)
  const rawoptions = dv.getUint8(3)
  if (rawtype >= 11) {
    throw new Error(`Invalid extra bytes "type" value: ${rawtype}`)
  }

  // If the "type" is 0, then these are "undocumented extra bytes".  In this
  // case, the size of the field is specified the "options" field.
  if (rawtype === 0) {
    const length = rawoptions
    return { name, description, length }
  }

  // Otherwise, these are normal extra bytes - parse out all the attributes.
  const options = parseOptions(rawoptions)
  const dimtype = parseType(rawtype)
  if (!dimtype) throw new Error(`Failed to extract dimension type: ${rawtype}`)
  const { type, size: length } = dimtype

  // We need to extract the nodata/min/max differently depending on the EB
  // "type" field.  For integers we extract the 64-bit version of whichever
  // signedness we have, and for float/double we extract doubles.
  function extractAnyType(offset: number) {
    switch (type) {
      case 'signed':
        return parseBigInt(dv.getBigInt64(offset, true))
      case 'unsigned':
        return parseBigInt(dv.getBigUint64(offset, true))
      case 'float':
        return dv.getFloat64(offset, true)
    }
  }

  const eb: ExtraBytes = { name, description, type, length }
  if (options.hasNodata) eb.nodata = extractAnyType(40)
  if (options.hasMin) eb.min = extractAnyType(64)
  if (options.hasMax) eb.max = extractAnyType(88)
  if (options.hasScale) eb.scale = dv.getFloat64(112)
  if (options.hasOffset) eb.offset = dv.getFloat64(136)
  return eb
}

function parseType(typecode: number) {
  switch (typecode) {
    case 1:
      return Dimension.Type.uint8
    case 2:
      return Dimension.Type.int8
    case 3:
      return Dimension.Type.uint16
    case 4:
      return Dimension.Type.int16
    case 5:
      return Dimension.Type.uint32
    case 6:
      return Dimension.Type.int32
    case 7:
      return Dimension.Type.float32
    case 8:
      return Dimension.Type.float64
  }
}

function parseOptions(v: number): ExtraBytes.Options {
  return {
    hasNodata: Boolean(v & 1),
    hasMin: Boolean((v >> 1) & 1),
    hasMax: Boolean((v >> 2) & 1),
    hasScale: Boolean((v >> 3) & 1),
    hasOffset: Boolean((v >> 4) & 1),
  }
}
