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
  export type Map = { [name: string]: Dimension | undefined }
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
  // Minimum size of one byte, so this is a convenience for a byte.
  bool: { type: 'unsigned', size: 1 },
  boolean: { type: 'unsigned', size: 1 },
} as const

export const Dimension = { Type, ctype }

function ctype({ type, size }: Dimension): string {
  switch (type) {
    case 'signed': {
      switch (size) {
        case 1:
          return 'int8'
        case 2:
          return 'int16'
        case 4:
          return 'int32'
        case 8:
          return 'int64'
      }
    }
    case 'unsigned': {
      switch (size) {
        case 1:
          return 'uint8'
        case 2:
          return 'uint16'
        case 4:
          return 'uint32'
        case 8:
          return 'uint64'
      }
    }
    case 'float': {
      switch (size) {
        case 4:
          return 'float'
        case 8:
          return 'double'
      }
    }
  }
  throw new Error(`Invalid dimension type/size: ${type}/${size}`)
}
