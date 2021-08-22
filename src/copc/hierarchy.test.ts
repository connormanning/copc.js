import { ellipsoidFilename, getGetter } from 'test'

import { Copc } from './copc'
import { Hierarchy } from './hierarchy'

const filename = ellipsoidFilename
const getter = getGetter(filename)

test('offsets', async () => {
  const copc = await Copc.walk(getter)

  const buffer = await getter(
    copc.offsets.rootHierarchyOffset,
    copc.offsets.rootHierarchyOffset + copc.offsets.rootHierarchyLength
  )
  const root = Hierarchy.parse(buffer)
  expect(root).toEqual<Hierarchy>({
    '0-0-0-0': {
      type: 'page',
      pointCount: 41179,
      pointDataOffset: 1438,
      pointDataLength: 231998,
    },
    '1-0-0-0': {
      type: 'page',
      pointCount: 264,
      pointDataOffset: 233436,
      pointDataLength: 2219,
    },
    '1-1-0-0': {
      type: 'page',
      pointCount: 12332,
      pointDataOffset: 235655,
      pointDataLength: 94658,
    },
    '1-0-1-0': {
      type: 'page',
      pointCount: 4558,
      pointDataOffset: 330313,
      pointDataLength: 34859,
    },
    '1-1-1-0': {
      type: 'page',
      pointCount: 4678,
      pointDataOffset: 365172,
      pointDataLength: 35103,
    },
  })
})
