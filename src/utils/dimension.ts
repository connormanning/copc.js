export declare namespace Dimension {
  export type Integral = {
    type: 'signed' | 'unsigned'
    size: 1 | 2 | 4 | 8
  }
  export type Float = {
    type: 'float'
    size: 4 | 8
  }
}
export type Dimension = Dimension.Integral | Dimension.Float

export declare namespace Dimension {
  export type Map = { [name: string]: Dimension }
}

const Type = {
  int8: { type: 'signed', size: 1 },
  int16: { type: 'signed', size: 2 },
  int32: { type: 'signed', size: 4 },
  int64: { type: 'signed', size: 8 },
  uint8: { type: 'unsigned', size: 1 },
  uint16: { type: 'unsigned', size: 2 },
  uint32: { type: 'unsigned', size: 4 },
  uint64: { type: 'unsigned', size: 8 },
  float32: { type: 'float', size: 4 },
  float64: { type: 'float', size: 8 },
  // Aliases.
  float: { type: 'float', size: 4 },
  double: { type: 'float', size: 8 },
  // Minimum size of one byte, so this is a convenience for a uint8.
  bool: { type: 'unsigned', size: 1 },
  boolean: { type: 'unsigned', size: 1 },
} as const

export const Dimension = { Type }
