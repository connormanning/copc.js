import { Binary } from 'utils'

import { Header } from './header'

//@ts-ignore
const isReady = () => !(global.Module.LASZip == undefined)

export declare namespace PointData {}
export type PointData = {}
export const PointData = { decompress }

type ChunkMetadata = Pick<
  Header,
  'pointCount' | 'pointDataRecordFormat' | 'pointDataRecordLength'
>

export async function decompress(
  compressed: Binary,
  { pointCount, pointDataRecordFormat, pointDataRecordLength }: ChunkMetadata
): Promise<Binary> {
  //@ts-ignore
  const { Module } = global;
  const outBuffer = new Uint8Array(pointCount * pointDataRecordLength)

  while (!isReady) await new Promise((resolve) => setTimeout(resolve, 5))

  const blobPointer = Module._malloc(compressed.byteLength)
  const dataPointer = Module._malloc(pointDataRecordLength)
  const decoder = new Module.ChunkDecoder()

  try {
    Module.HEAPU8.set(
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
          Module.HEAPU8.buffer,
          dataPointer,
          pointDataRecordLength
        ),
        i * pointDataRecordLength
      )
    }
  } finally {
    Module._free(blobPointer)
    Module._free(dataPointer)
    decoder.delete()
  }

  return outBuffer
}
