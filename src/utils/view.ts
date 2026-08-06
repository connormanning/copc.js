import { Dimension } from './dimension.js'

export declare namespace View {
  export type Getter = (index: number) => number
}
export type View = {
  pointCount: number
  dimensions: Dimension.Map
  getter: (name: string) => View.Getter
}
