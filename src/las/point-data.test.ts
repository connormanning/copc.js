import { promises as fs } from 'fs'
import { join } from 'path'

import * as Las from 'las'
import * as Test from 'test'
import { Getter } from 'utils'

import { decompressChunk, decompressFile } from './point-data'

const chunkTableAdjustment = 8

test('decompress chunk', async () => {
  const buffer = await fs.readFile(join(Test.dirname, 'data/ellipsoid-1.4.laz'))
  const header = Las.Header.parse(buffer)
  const compressed = buffer.subarray(
    header.pointDataOffset + chunkTableAdjustment,
  )
  const pointdata = await decompressChunk(compressed, header)

  const getter: Getter = async (begin, end) => buffer.subarray(begin, end)
  const vlrs = await Las.Vlr.walk(getter, header)
  const ebVlr = Las.Vlr.find(vlrs, 'LASF_Spec', 4)
  const eb = ebVlr && Las.ExtraBytes.parse(await Las.Vlr.fetch(getter, ebVlr))

  const view = Las.View.create(pointdata, header, eb)
  const getters = ['X', 'Y', 'Z', 'Intensity', 'InvertedIntensity'].map(
    view.getter,
  )

  {
    const [x, y, z, i, ii] = getters.map((f) => f(0))
    expect(x >= header.min[0])
    expect(y >= header.min[1])
    expect(z >= header.min[2])
    expect(x <= header.max[0])
    expect(y <= header.max[1])
    expect(z <= header.max[2])
    expect(i).not.toEqual(ii)
  }
  {
    const [x, y, z, i, ii] = getters.map((f) => f(1))
    expect(x >= header.min[0])
    expect(y >= header.min[1])
    expect(z >= header.min[2])
    expect(x <= header.max[0])
    expect(y <= header.max[1])
    expect(z <= header.max[2])
    expect(i).not.toEqual(ii)
  }
})

test('decompress file', async () => {
  const buffer = await fs.readFile(join(Test.dirname, 'data/ellipsoid-1.4.laz'))
  const header = Las.Header.parse(buffer)
  const pointdata = await decompressFile(buffer)

  const getter: Getter = async (begin, end) => buffer.subarray(begin, end)
  const vlrs = await Las.Vlr.walk(getter, header)
  const ebVlr = Las.Vlr.find(vlrs, 'LASF_Spec', 4)
  const eb = ebVlr && Las.ExtraBytes.parse(await Las.Vlr.fetch(getter, ebVlr))

  const view = Las.View.create(pointdata, header, eb)
  const getters = ['X', 'Y', 'Z', 'Intensity', 'InvertedIntensity'].map(
    view.getter,
  )

  {
    const [x, y, z, i, ii] = getters.map((f) => f(0))
    expect(x >= header.min[0])
    expect(y >= header.min[1])
    expect(z >= header.min[2])
    expect(x <= header.max[0])
    expect(y <= header.max[1])
    expect(z <= header.max[2])
    expect(i).not.toEqual(ii)
  }
  {
    const [x, y, z, i, ii] = getters.map((f) => f(1))
    expect(x >= header.min[0])
    expect(y >= header.min[1])
    expect(z >= header.min[2])
    expect(x <= header.max[0])
    expect(y <= header.max[1])
    expect(z <= header.max[2])
    expect(i).not.toEqual(ii)
  }
})
