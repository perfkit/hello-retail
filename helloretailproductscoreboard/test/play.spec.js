const assert = require('assert')

const curry = fn =>
  (...xs) =>
    (xs.length >= fn.length
      ? fn(...xs)
      : curry(fn.bind(null, ...xs)))

// A curried function
// Curry: named after Haskell Curry
const increaseByOne = curry((report, rows) =>
  rows
    .map(row => Object.assign({}, row, { x: row.x + 1 }))
    .map((row) => {
      report(row)
      return row
    }))

describe('play', () => {
  it('should increase x by one for each row', () => {
    const rows = [
      { x: 23, y: 10 },
      { x: 50, y: 20 },
    ]
    const actual = increaseByOne(() => {}, rows)
    const expected = [
      { x: 24, y: 10 },
      { x: 51, y: 20 },
    ]
    assert.deepStrictEqual(actual, expected)
  })
  it('should report the updated rows', () => {
    const rows = [
      { x: 23, y: 10 },
      { x: 50, y: 20 },
    ]
    const reported = []
    increaseByOne(row => reported.push(row))(rows)
    const expected = [
      { x: 24, y: 10 },
      { x: 51, y: 20 },
    ]
    assert.deepStrictEqual(reported, expected)
  })
})
