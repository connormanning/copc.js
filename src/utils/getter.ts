import { Forager } from 'forager'

export type Getter = (begin: number, end: number) => Promise<Uint8Array>
export const Getter = { create }

function create(arg: string | Getter): Getter {
	if (typeof arg ==='function') return arg
  return async function getter(begin, end) {
    return Forager.read(arg, { range: [begin, end] })
  }
}
