import { Binary } from '../utils/index.js'
import * as Utils from '../utils/index.js'

import { Dimensions } from './dimensions.js'
import { ExtraBytes } from './extra-bytes.js'
import { Extractor } from './extractor.js'

export const View = { create }

function create(
  buffer: Binary,
  header: Extractor.PartialHeader,
  eb: ExtraBytes[] = [],
  include?: string[],
): Utils.View {
  let extractors = Extractor.create(header, eb)
  if (include) {
    const set = new Set([...include])
    extractors = Object.entries(extractors).reduce<Utils.Extractor.Map>(
      (extractors, [name, getter]) => {
        if (set.has(name)) extractors[name] = getter
        return extractors
      },
      {},
    )
  }
  const dimensions = Dimensions.create(extractors, eb)
  const dv = Binary.toDataView(buffer)

  const pointLength = header.pointDataRecordLength

  if (dv.byteLength % pointLength !== 0) {
    throw new Error(
      `Invalid buffer length (${dv.byteLength}) for point length ${pointLength}`,
    )
  }
  const pointCount = dv.byteLength / header.pointDataRecordLength

  function getter(name: string): Utils.View.Getter {
    const extractor = extractors[name]
    if (!extractor) throw new Error(`No extractor for dimension: ${name}`)
    return function (index) {
      if (index >= pointCount) {
        throw new RangeError(
          `View index (${index}) out of range: ${pointCount}`,
        )
      }
      return extractor(dv, index)
    }
  }
  return { pointCount, dimensions, getter }
}
