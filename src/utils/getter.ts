export type Getter = (begin: number, end: number) => Promise<Uint8Array>
export const Getter = { create }

function create(arg: string | Getter): any {
	if (typeof arg ==='function') return arg
  const getter = (begin: number, end: number) => fetch(arg, {
      headers: {
        range: `bytes=${begin}-${end - 1}`
      }
    }
	);
	return getter;
}
