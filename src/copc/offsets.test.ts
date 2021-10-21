import { Forager } from 'forager'

import { Header, Vlr } from 'las'
import { ellipsoidFilename } from 'test'

import { Offsets } from './offsets'

const filename = ellipsoidFilename

test('offsets', async () => {
  const hbuffer = await Forager.read(filename, { range: [0, 375] })
  const header = Header.parse(hbuffer)
  const vlrs = await Vlr.walk(filename, header)

  const copcVlr = vlrs.find((v) => v.userId === 'entwine' && v.recordId === 1)
  if (!copcVlr) throw new Error('COPC VLR is required')

  const buffer = await Forager.read(filename, {
    range: [
      copcVlr.contentOffset,
      copcVlr.contentOffset + copcVlr.contentLength,
    ],
  })
  const offsets = Offsets.parse(buffer)
  expect(offsets).toEqual<Offsets>({
    span: 0,
    rootHierarchyOffset: 400368,
    rootHierarchyLength: 160,
  })
})
