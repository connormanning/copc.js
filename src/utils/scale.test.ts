import { Scale } from './scale'

test('apply', () => {
  expect(Scale.apply(100)).toEqual(100)
  expect(Scale.apply(100, 0.1)).toEqual(1000)
  expect(Scale.apply(100, 0.1, 50)).toEqual(500)
})

test('unapply', () => {
  expect(Scale.unapply(100)).toEqual(100)
  expect(Scale.unapply(1000, 0.1)).toEqual(100)
  expect(Scale.unapply(500, 0.1, 50)).toEqual(100)
})
