import { ellipsoidFilename } from 'test'

import { Dimension } from 'utils'
import { Copc } from '.'

const filename = ellipsoidFilename

test('data', async () => {
  const copc = await Copc.create(filename)
  const { nodes } = await Copc.loadHierarchyPage(
    filename,
    copc.info.rootHierarchyPage
  )
  const { ['0-0-0-0']: root } = nodes
  if (!root) throw new Error('Failed to load hierarchy root node')
  const view = await Copc.loadPointDataView(filename, copc, root)

  expect(view.dimensions).toEqual<Dimension.Map>({
    X: { type: 'float', size: 8 },
    Y: { type: 'float', size: 8 },
    Z: { type: 'float', size: 8 },
    Intensity: { type: 'unsigned', size: 2 },
    ReturnNumber: { type: 'unsigned', size: 1 },
    NumberOfReturns: { type: 'unsigned', size: 1 },
    ScanDirectionFlag: { type: 'unsigned', size: 1 },
    EdgeOfFlightLine: { type: 'unsigned', size: 1 },
    Classification: { type: 'unsigned', size: 1 },
    ScannerChannel: { type: 'unsigned', size: 1 },
    Synthetic: { type: 'unsigned', size: 1 },
    KeyPoint: { type: 'unsigned', size: 1 },
    Withheld: { type: 'unsigned', size: 1 },
    Overlap: { type: 'unsigned', size: 1 },
    ScanAngle: { type: 'float', size: 4 },
    UserData: { type: 'unsigned', size: 1 },
    PointSourceId: { type: 'unsigned', size: 2 },
    GpsTime: { type: 'float', size: 8 },
    Red: { type: 'unsigned', size: 2 },
    Green: { type: 'unsigned', size: 2 },
    Blue: { type: 'unsigned', size: 2 },
  })
  const xyz = [view.getter('X'), view.getter('Y'), view.getter('Z')]

  let min = [Infinity, Infinity, Infinity]
  let max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < view.pointCount; ++i) {
    const p = xyz.map((get) => get(i))
    min = p.map((v, i) => Math.min(v, min[i]))
    max = p.map((v, i) => Math.max(v, max[i]))
  }

  expect(min[0]).toBeGreaterThanOrEqual(copc.header.min[0])
  expect(min[1]).toBeGreaterThanOrEqual(copc.header.min[1])
  expect(min[2]).toBeGreaterThanOrEqual(copc.header.min[2])
  expect(max[0]).toBeLessThanOrEqual(copc.header.max[0])
  expect(max[1]).toBeLessThanOrEqual(copc.header.max[1])
  expect(max[2]).toBeLessThanOrEqual(copc.header.max[2])
})
