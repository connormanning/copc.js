import { Bounds, Range } from 'utils'

import { Info } from './info'

test('info', () => {
  const buffer = Buffer.alloc(160)
  const center = [1.5, 2.5, 3.5]
  const radius = 10
  const spacing = 42
  const rootHierarchyOffset = 500
  const rootHierarchyLength = 600
  const gpsTimeRange: Range = [-50.5, 20.5]

  buffer.writeDoubleLE(center[0], 0)
  buffer.writeDoubleLE(center[1], 8)
  buffer.writeDoubleLE(center[2], 16)
  buffer.writeDoubleLE(radius, 24)
  buffer.writeDoubleLE(spacing, 32)
  buffer.writeBigUInt64LE(BigInt(rootHierarchyOffset), 40)
  buffer.writeBigUInt64LE(BigInt(rootHierarchyLength), 48)
  buffer.writeDoubleLE(gpsTimeRange[0], 56)
  buffer.writeDoubleLE(gpsTimeRange[1], 64)

  const cube: Bounds = [
    center[0] - radius,
    center[1] - radius,
    center[2] - radius,
    center[0] + radius,
    center[1] + radius,
    center[2] + radius,
  ]
  const info = Info.parse(buffer)
  expect(info).toEqual<Info>({
    cube,
    spacing,
    rootHierarchyPage: {
      pageOffset: rootHierarchyOffset,
      pageLength: rootHierarchyLength,
    },
    gpsTimeRange,
  })

  expect(() => Info.parse(Buffer.concat([buffer, Buffer.alloc(1)]))).toThrow(
    /length/i
  )
})
