import { createLazPerf } from 'laz-perf'
import { Binary } from 'utils'

import { Header } from './header'

export declare namespace PointData {}
export type PointData = {}
export const PointData = { decompress }

type ChunkMetadata = Pick<
  Header,
  'pointCount' | 'pointDataRecordFormat' | 'pointDataRecordLength'
>

const lazPerfPromise = createLazPerf()

export async function decompress(
  compressed: Binary,
  { pointCount, pointDataRecordFormat, pointDataRecordLength }: ChunkMetadata
): Promise<Binary> {
  const LazPerf = await lazPerfPromise
  const outBuffer = new Uint8Array(pointCount * pointDataRecordLength)

  const blobPointer = LazPerf._malloc(compressed.byteLength)
  const dataPointer = LazPerf._malloc(pointDataRecordLength)
  const decoder = new LazPerf.ChunkDecoder()

  try {
    LazPerf.HEAPU8.set(
      new Uint8Array(
        compressed.buffer,
        compressed.byteOffset,
        compressed.byteLength
      ),
      blobPointer
    )

    decoder.open(pointDataRecordFormat, pointDataRecordLength, blobPointer)

    for (let i = 0; i < pointCount; ++i) {
      decoder.getPoint(dataPointer)

      outBuffer.set(
        new Uint8Array(
          LazPerf.HEAPU8.buffer,
          dataPointer,
          pointDataRecordLength
        ),
        i * pointDataRecordLength
      )
    }
  } finally {
    LazPerf._free(blobPointer)
    LazPerf._free(dataPointer)
    decoder.delete()
  }

  return outBuffer
}
