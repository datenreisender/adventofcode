/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars, lines, chars } = require('./setup') // eslint-disable-line no-unused-vars

const part1 = TODO

xtest('acceptance of part 1', () => {
  const acceptanceInput = chars(`
.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.
  `.trim())

  expect(part1(acceptanceInput)).toBe(1147)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContent()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
