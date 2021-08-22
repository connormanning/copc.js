import { Forager } from 'forager'

import { ellipsoidFilename } from 'test'

import { Header } from '.'

const filename = ellipsoidFilename

test('header', async () => {
  const buffer = await Forager.read(filename, { range: [0, 375] })
  const header = Header.parse(buffer)

  expect(header).toEqual<Header>({
    fileSignature: 'LASF',
    fileSourceId: 0,
    globalEncoding: 16,
    projectId: '00000000-0000-0000-0000000000000000',
    majorVersion: 1,
    minorVersion: 4,
    systemIdentifier: '',
    generatingSoftware: '',
    fileCreationDayOfYear: 1,
    fileCreationYear: 1,
    headerLength: 375,
    pointDataOffset: 1430,
    vlrCount: 3,
    pointDataRecordFormat: 3,
    pointDataRecordLength: 34,
    pointCount: 63011,
    pointCountByReturn: [31731, 31280, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    scale: [0.01, 0.01, 0.01],
    offset: [-8242596, 4966656, 100],
    min: [-8242746, 4966506, -50],
    max: [-8242446, 4966706, 50],
    waveformDataOffset: 0,
    evlrOffset: 400308,
    evlrCount: 1,
  })
})
