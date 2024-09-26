import { Bounds, Dimension } from '../utils'

export type Ept = {
  bounds: Bounds
  boundsConforming: Bounds
  dataType: 'binary' | 'laszip' | 'zstandard'
  hierarchyType: 'json'
  points: number
  schema: (Dimension & { name: string })[]
  span: number
  srs?: {
    wkt?: string
    authority?: string
    horizontal?: string
    vertical?: string
  }
  version: '1.0.0' | '1.1.0'
}
