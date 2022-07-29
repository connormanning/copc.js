import { Binary } from '.'

test('to data view', () => {
	const buffer = Buffer.from('asdf')
	const view = Binary.toDataView(buffer)
	expect(view.buffer).toBe(buffer.buffer)
	expect(view.byteOffset).toEqual(buffer.byteOffset)
	expect(view.byteLength).toEqual(buffer.byteLength)
})

test('to cstring', () => {
	const buffer = Buffer.from('asdf')
	expect(Binary.toCString(buffer)).toEqual('asdf')
})
