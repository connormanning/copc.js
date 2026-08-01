import { LazPerf, createLazPerf } from 'laz-perf'
import { Binary } from '../utils'

import { Header } from './header'

export declare namespace PointData {}
export type PointData = {}
export const PointData = { createLazPerf, decompressChunk, decompressFile }

type ChunkMetadata = Pick<
  Header,
  'pointCount' | 'pointDataRecordFormat' | 'pointDataRecordLength'
>

let ourLazPerfPromise: Promise<LazPerf> | undefined = undefined

async function getLazPerf(suppliedLazPerf?: LazPerf): Promise<LazPerf> {
  if (suppliedLazPerf) return suppliedLazPerf
  if (!ourLazPerfPromise) ourLazPerfPromise = createLazPerf()
  return ourLazPerfPromise
}

export async function decompressChunk(
  compressed: Binary,
  { pointCount, pointDataRecordFormat, pointDataRecordLength }: ChunkMetadata,
  suppliedLazPerf?: LazPerf,
): Promise<Binary> {
  const LazPerf = await getLazPerf(suppliedLazPerf)
  const outBuffer = new Uint8Array(pointCount * pointDataRecordLength)

  let blobPointer = 0
  let dataPointer = 0
  let decoder: InstanceType<typeof LazPerf.ChunkDecoder> | undefined

  try {
    blobPointer = LazPerf._malloc(compressed.byteLength)
    dataPointer = LazPerf._malloc(pointDataRecordLength)
    decoder = new LazPerf.ChunkDecoder()

    LazPerf.HEAPU8.set(
      new Uint8Array(
        compressed.buffer,
        compressed.byteOffset,
        compressed.byteLength,
      ),
      blobPointer,
    )

    decoder.open(pointDataRecordFormat, pointDataRecordLength, blobPointer)

    for (let i = 0; i < pointCount; ++i) {
      decoder.getPoint(dataPointer)

      outBuffer.set(
        new Uint8Array(
          LazPerf.HEAPU8.buffer,
          dataPointer,
          pointDataRecordLength,
        ),
        i * pointDataRecordLength,
      )
    }
  } finally {
    LazPerf._free(blobPointer)
    LazPerf._free(dataPointer)
    decoder?.delete()
  }

  return outBuffer
}

export async function decompressFile(
  file: Binary,
  suppliedLazPerf?: LazPerf,
): Promise<Binary> {
  const LazPerf = await getLazPerf(suppliedLazPerf)
  const header = Header.parse(file)
  const { pointCount, pointDataRecordLength } = header
  const outBuffer = new Uint8Array(pointCount * pointDataRecordLength)

  let blobPointer = 0
  let dataPointer = 0
  let reader: InstanceType<typeof LazPerf.LASZip> | undefined

  try {
    blobPointer = LazPerf._malloc(file.byteLength)
    dataPointer = LazPerf._malloc(pointDataRecordLength)
    reader = new LazPerf.LASZip()

    LazPerf.HEAPU8.set(
      new Uint8Array(file.buffer, file.byteOffset, file.byteLength),
      blobPointer,
    )

    reader.open(blobPointer, file.byteLength)

    for (let i = 0; i < pointCount; ++i) {
      reader.getPoint(dataPointer)

      outBuffer.set(
        new Uint8Array(
          LazPerf.HEAPU8.buffer,
          dataPointer,
          pointDataRecordLength,
        ),
        i * pointDataRecordLength,
      )
    }
  } finally {
    LazPerf._free(blobPointer)
    LazPerf._free(dataPointer)
    reader?.delete()
  }

  return outBuffer
}
