import { Bounds, Binary, Point, getBigUint64, parseBigInt } from '../utils'

import { infoLength } from './constants'
import type { Hierarchy } from './hierarchy'

export type Info = {
  cube: Bounds
  spacing: number
  rootHierarchyPage: Hierarchy.Page
  gpsTimeRange: [number, number]
}
export const Info = { parse }

function parse(buffer: Binary): Info {
  const dv = Binary.toDataView(buffer)

  if (dv.byteLength !== infoLength) {
    throw new Error(
      `Invalid COPC info VLR length (should be ${infoLength}): ${dv.byteLength}`,
    )
  }

  const center: Point = [
    dv.getFloat64(0, true),
    dv.getFloat64(8, true),
    dv.getFloat64(16, true),
  ]
  const radius = dv.getFloat64(24, true)

  return {
    cube: [
      center[0] - radius,
      center[1] - radius,
      center[2] - radius,
      center[0] + radius,
      center[1] + radius,
      center[2] + radius,
    ],
    spacing: dv.getFloat64(32, true),
    rootHierarchyPage: {
      pageOffset: parseBigInt(getBigUint64(dv, 40, true)),
      pageLength: parseBigInt(getBigUint64(dv, 48, true)),
    },
    gpsTimeRange: [dv.getFloat64(56, true), dv.getFloat64(64, true)],
  }
}
