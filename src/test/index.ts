import { dirname as getDirname, join } from 'path'
import { fileURLToPath } from 'url'

export const dirname = getDirname(fileURLToPath(import.meta.url))
export const ellipsoidFilename = join(dirname, 'data/ellipsoid.copc.laz')
