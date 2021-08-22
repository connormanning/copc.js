type Pointer = number

declare class LASZip {
  constructor()
  delete(): void
  open(pointer: Pointer, length: number): void
  getPoint(pointer: Pointer): void
}

declare class ChunkDecoder {
  constructor()
  delete(): void
  open(
    pointDataRecordFormat: number,
    pointDataRecordLength: number,
    pointer: Pointer
  ): void

  getPoint(pointer: Pointer): void
}

export declare interface LazPerf extends EmscriptenModule {
  LASZip: typeof LASZip
  ChunkDecoder: typeof ChunkDecoder
}
declare const lazperf: LazPerf
export default lazperf
