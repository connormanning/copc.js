import { Step } from './step'

export type Key = [depth: number, x: number, y: number, z: number]
export const Key = { create, parse, toString, step, compare, depth }

// Often at the API level, we want to accept both the string form as well as the
// array form as a given Key.  So many of these functions work with both.

function create(key: Key | string): Key
function create(d: number, x: number, y: number, z: number): Key
function create(key: Key | string | number, x = 0, y = 0, z = 0): Key {
  if (typeof key !== 'number') return parse(key)
  return [key, x, y, z]
}

function parse(s: Key | string): Key {
  if (typeof s !== 'string') return s

  const [d, x, y, z, ...rest] = s.split('-').map((s) => parseInt(s, 10))
  const key: Key = [d, x, y, z]

  if (
    rest.length !== 0 ||
    key.some((v) => typeof v !== 'number' || Number.isNaN(v))
  ) {
    throw new Error(`Invalid key: ${s}`)
  }

  return key
}

function toString(key: Key | string) {
  if (typeof key === 'string') return key
  return key.join('-')
}

function step(key: Key | string, [a, b, c]: Step): Key {
  const [d, x, y, z] = Key.create(key)
  return [d + 1, x * 2 + a, y * 2 + b, z * 2 + c]
}

function compare(a: Key, b: Key) {
	if (a[0] < b[0]) return -1
	if (a[0] > b[0]) return 1

	for (let i = 0; i < a.length; ++i) {
		if (a[i] < b[i]) return -1
		if (a[i] > b[i]) return 1
	}
	return 0
}

function depth(key: Key) {
  return key[0]
}
