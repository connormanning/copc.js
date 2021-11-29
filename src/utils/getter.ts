export type Getter = (begin: number, end: number) => Promise<Uint8Array>
export const Getter = { create }

// This was taken from: https://dev.to/ycmjason/javascript-fetch-retry-upon-failure-3p6g
const fetch_retry = (url: string, options: any, n: number): Promise<any> => 
  fetch(url, options)
    .catch((error) => {
      if (n === 0) { 
        throw error
      };
      return fetch_retry(url, options, n - 1);
    });

function create(arg: string | Getter): any {
	if (typeof arg ==='function') return arg
  return (begin: number, end: number)  => {
	  return fetch_retry(
      arg, 
      {
        headers: {
          range: `bytes=${begin}-${end - 1}`
        }
      }, 
      1
    )
      .then(response => response.arrayBuffer())
      .then(bufferedResponse => new Uint8Array(bufferedResponse));
  }
}
