export declare namespace Extractor {
  export type Map = { [name: string]: Extractor | undefined }
}
export type Extractor = (dv: DataView, index: number) => number
