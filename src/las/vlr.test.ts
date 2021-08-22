import { Forager } from 'forager'

import { ellipsoidFilename } from 'test'

import { Header, Vlr } from '.'

const filename = ellipsoidFilename

test('walk', async () => {
  const buffer = await Forager.read(filename, { range: [0, 375] })
  const header = Header.parse(buffer)

  const vlrs = await Vlr.walk(filename, header)
  expect(vlrs).toEqual<Vlr[]>([
    {
      userId: 'entwine',
      recordId: 1,
      contentLength: 160,
      description: 'COPC offsets',
      isExtended: false,
      contentOffset: 429,
    },
    {
      userId: 'laszip encoded',
      recordId: 22204,
      contentLength: 52,
      description: 'lazperf variant',
      isExtended: false,
      contentOffset: 643,
    },
    {
      userId: 'LASF_Projection',
      recordId: 2112,
      contentLength: 681,
      description: '',
      isExtended: false,
      contentOffset: 749,
    },
    {
      userId: 'entwine',
      recordId: 1000,
      contentLength: 160,
      description: 'EPT Hierarchy',
      isExtended: true,
      contentOffset: 400368,
    },
  ])
})
