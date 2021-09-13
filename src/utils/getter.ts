export type Getter = (begin: number, end: number) => Promise<Uint8Array>
export const Getter = { create }

function create(arg: string | Getter): any {
	if (typeof arg ==='function') return arg
  return (begin: number, end: number)  => {
	  return fetch(arg, {
        headers: {
          range: `bytes=${begin}-${end - 1}`
        }
      }
    )
      .then(response => response.arrayBuffer())
      .then(bufferedResponse => new Uint8Array(bufferedResponse));
  }
}
