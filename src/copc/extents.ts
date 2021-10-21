import { Binary } from '../utils'
import { Dimensions } from '../las/dimensions'
import { Extractor } from '../las/extractor'
import { Header } from '../las/header'

export const Extents = { parse }

function parse(header: Header, buffer: Binary): Object {
  const dv = Binary.toDataView(buffer)
  
  const extractors = Extractor.create(header)
  const dimensions = Dimensions.create(extractors)

  let current_pos = 0;
  return Object.keys(dimensions).reduce((newmap, name) => {
    let ret = { ...newmap, [name]: { "min": Number(dv.getFloat64(current_pos, true)), "max": Number(dv.getFloat64(current_pos + 8, true)) } }
    current_pos += 8 * 2
    return ret
  }, {})
}
