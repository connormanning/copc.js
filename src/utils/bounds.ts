import { Point } from './point'
import { Key } from './key'
import { Step } from './step'

export type Bounds = [...Point, ...Point]
export const Bounds = {
  min,
  max,
  mid,
  width,
  depth,
  height,
  cube,
  step,
  stepTo,
  intersection,
}

function min(b: Bounds): Point {
  return [b[0], b[1], b[2]]
}
function max(b: Bounds): Point {
  return [b[3], b[4], b[5]]
}
function mid([minx, miny, minz, maxx, maxy, maxz]: Bounds): Point {
  return [
    minx + (maxx - minx) / 2,
    miny + (maxy - miny) / 2,
    minz + (maxz - minz) / 2,
  ]
}

function width(bounds: Bounds) {
  return bounds[3] - bounds[0]
}
function depth(bounds: Bounds) {
  return bounds[4] - bounds[1]
}
function height(bounds: Bounds) {
  return bounds[5] - bounds[2]
}

function cube(bounds: Bounds): Bounds {
  const point = mid(bounds)
  const radius = Math.max(width(bounds), depth(bounds), height(bounds)) / 2
  return [
    point[0] - radius,
    point[1] - radius,
    point[2] - radius,
    point[0] + radius,
    point[1] + radius,
    point[2] + radius,
  ]
}

function step(bounds: Bounds, [a, b, c]: Step): Bounds {
  const [minx, miny, minz, maxx, maxy, maxz] = bounds
  const [midx, midy, midz] = mid(bounds)

  return [
    a ? midx : minx,
    b ? midy : miny,
    c ? midz : minz,
    a ? maxx : midx,
    b ? maxy : midy,
    c ? maxz : midz,
  ]
}

function stepTo(bounds: Bounds, [d, x, y, z]: Key) {
  for (let i = d - 1; i >= 0; --i) {
    bounds = step(bounds, [(x >> i) & 1, (y >> i) & 1, (z >> i) & 1] as Step)
  }
  return bounds
}

function intersection(a: Bounds, b: Bounds): Bounds {
  return [
    Math.max(a[0], b[0]),
    Math.max(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.min(a[3], b[3]),
    Math.min(a[4], b[4]),
    Math.min(a[5], b[5]),
  ]
}
