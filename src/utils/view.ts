export declare namespace View {
  type Getter = (index: number) => number
}
export type View = { pointCount: number; getter: (name: string) => View.Getter }
