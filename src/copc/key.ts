export type Key = [depth: number, x: number, y: number, z: number]
export const Key = { toString, parse }

// Often at the API level, we want to accept both the string form as well as the
// array form as a given Key.  So these functions work with both.

function toString(key: Key | string) {
	if (typeof key === 'string') return key
  return key.join('-')
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
