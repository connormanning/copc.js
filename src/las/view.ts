import { Binary } from 'utils'
import * as Utils from 'utils'

import { Dimensions } from './dimensions'
import { Extractor } from './extractor'
import { Header } from './header'

export const View = { create }

function create(header: Header, buffer: Binary): Utils.View {
  const extractors = Extractor.create(header)
  const dimensions = Dimensions.create(extractors)
  const dv = Binary.toDataView(buffer)

  const pointLength = header.pointDataRecordLength

  if (dv.byteLength % pointLength !== 0) {
    throw new Error(
      `Invalid buffer length (${dv.byteLength}) for point length ${pointLength}`
    )
  }
  const pointCount = dv.byteLength / header.pointDataRecordLength

  function getter(name: string): Utils.View.Getter {
    const extractor = extractors[name]
    if (!extractor) throw new Error(`No extractor for dimension: ${name}`)
    return function (index) {
      if (index >= pointCount) {
        throw new RangeError(
          `View index (${index}) out of range: ${pointCount}`
        )
      }
      return extractor(dv, index)
    }
  }
  return { pointCount, dimensions, getter }
}
