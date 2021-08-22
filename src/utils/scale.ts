export const Scale = {
  apply: (v: number, scale = 1, offset = 0) => (v - offset) / scale,
  unapply: (v: number, scale = 1, offset = 0) => v * scale + offset,
}
