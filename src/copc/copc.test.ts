import { ellipsoidFilename } from 'test'

import { Copc } from '.'

const filename = ellipsoidFilename

test('data', async () => {
  const copc = await Copc.create(filename)
  const view = await Copc.loadPointData(filename, copc, '0-0-0-0')
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
