import { BaseHierarchy } from '../utils'

export type Hierarchy = Record<string, number | undefined>

export const Hierarchy = { parse }

function parse(e: Hierarchy): BaseHierarchy.Subtree {
  return Object.entries(e).reduce<BaseHierarchy.Subtree>(
    (h, [keystring, pointCount]) => {
      if (pointCount === -1) h.pages[keystring] = {}
      else if (pointCount) h.nodes[keystring] = { pointCount }
      return h
    },
    { nodes: {}, pages: {} }
  )
}
