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
      contentOffset: 429,
      contentLength: 160,
      description: 'COPC offsets',
      isExtended: false,
    },
    {
      userId: 'laszip encoded',
      recordId: 22204,
      contentOffset: 643,
      contentLength: 52,
      description: 'lazperf variant',
      isExtended: false,
    },
    {
      userId: 'LASF_Projection',
      recordId: 2112,
      contentOffset: 749,
      contentLength: 681,
      description: '',
      isExtended: false,
    },
    {
      userId: 'entwine',
      recordId: 1000,
      contentOffset: 400368,
      contentLength: 160,
      description: 'EPT Hierarchy',
      isExtended: true,
    },
  ])
})
