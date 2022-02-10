import fetch from 'cross-fetch'

export type Getter = (begin: number, end: number) => Promise<Uint8Array>
export const Getter = { create }

function create(arg: string | Getter): Getter {
  if (typeof arg === 'function') return arg

  if (arg.startsWith('http://') || arg.startsWith('https://')) {
    return getHttpGetter(arg)
  }

  return getFsGetter(arg)
}

function getHttpGetter(filename: string): Getter {
  return async function getter(begin, end) {
    const response = await fetch(filename, {
      headers: { Range: `bytes=${begin}-${end - 1}` },
    })

    const ab = await response.arrayBuffer()
    return new Uint8Array(ab)
  }
}

function getFsGetter(filename: string): Getter {
  return async function getter(begin, end) {
    const fs = await import('fs')

    async function read(begin = 0, end = Infinity): Promise<Uint8Array> {
      if (begin < 0 || end < 0 || begin > end) throw new Error('Invalid range')

      await fs.promises.access(filename)
      const stream = fs.createReadStream(filename, {
        start: begin,
        end: end - 1,
        autoClose: true,
      })
      return drain(stream)
    }

    return read(begin, end)
  }
}

async function drain(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
