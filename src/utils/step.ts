export type Step = [0 | 1, 0 | 1, 0 | 1]
export const Step = { fromIndex, list }

function fromIndex(i: number): Step {
  if (i < 0 || i >= 8) throw new Error(`Invalid step index: ${i}`)

  const x = (i >> 0) & 1 ? 1 : 0
  const y = (i >> 1) & 1 ? 1 : 0
  const z = (i >> 2) & 1 ? 1 : 0
  return [x, y, z]
}

function list(): Step[] {
  return [
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 1, 1],
  ]
}
