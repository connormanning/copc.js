import { Forager } from 'forager'
import { join } from 'path'
import { GetRange } from 'utils'

export const dirname = __dirname
export const ellipsoidFilename = join(dirname, 'data/ellipsoid.copc.laz')
export const getGetter: (filename: string) => GetRange = (filename: string) => {
  return async function getter(begin: number, end: number) {
    return Forager.read(filename, { range: [begin, end] })
  }
}
