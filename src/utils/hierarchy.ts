export declare namespace BaseHierarchy {
  export type Node = {
    pointCount: number
  }
  export namespace Node {
    export type Map = Record<string, Node | undefined>
  }

  export type Page = {}
  export namespace Page {
    export type Map = Record<string, Page | undefined>
  }

  export type Subtree = { nodes: Node.Map; pages: Page.Map }
}
