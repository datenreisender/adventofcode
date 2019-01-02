/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last } = require('ramda') // eslint-disable-line no-unused-vars

const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars } = require('./setup') // eslint-disable-line no-unused-vars

const part1 = TODO

xtest('acceptance of part 1', () => require('./day15-testAcceptanceOfPart1')(part1))

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentChars()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
