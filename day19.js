/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys, xprod, T } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars, lines, chars } = require('./setup') // eslint-disable-line no-unused-vars

const part1 = TODO

test('acceptance of part 1', () => {
  const acceptanceInput = [
    '#ip 0',
    'seti 5 0 1',
    'seti 6 0 2',
    'addi 0 1 0',
    'addr 1 2 3',
    'setr 1 0 0',
    'seti 8 0 4',
    'seti 9 0 5'
  ]

  expect(part1(acceptanceInput)).toBe(6)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentLines()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
