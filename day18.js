/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys, xprod, T } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars, lines, chars } = require('./setup') // eslint-disable-line no-unused-vars

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

const states = {
  open: '.',
  tree: '|',
  lumberyard: '#'
}

const surroundingOffsets = reject(equals([0, 0]), xprod([-1, 0, 1], [-1, 0, 1]))

const adjacentAcres = (field, x, y) =>
  surroundingOffsets.map(([offsetX, offsetY]) =>
    pathOr(states.open, [y + offsetY, x + offsetX], field)
  )

const count = (state, acres) => acres.filter(equals(state)).length

const evolveField = field =>
  field.map((row, y) => row.map((acre, x) => {
    const adjacent = adjacentAcres(field, x, y)
    if (acre === states.open) { return count(states.tree, adjacent) >= 3 ? states.tree : states.open }
    if (acre === states.tree) { return count(states.lumberyard, adjacent) >= 3 ? states.lumberyard : states.tree }
    return count(states.lumberyard, adjacent) === 0 || count(states.tree, adjacent) === 0 ? states.open : states.lumberyard
  }))

test('acceptance of evolve field', () => {
  const afterFirstMinute = chars(`
.......##.
......|###
.|..|...#.
..|#||...#
..##||.|#|
...#||||..
||...|||..
|||||.||.|
||||||||||
....||..|.
  `.trim())

  expect(evolveField(acceptanceInput)).toEqual(afterFirstMinute)
})

const part1 = field => {
  const finalField = times(T, 10).reduce(evolveField, field)

  return count(states.tree, finalField.flat()) * count(states.lumberyard, finalField.flat())
}

test('acceptance of part 1', () => {
  expect(part1(acceptanceInput)).toBe(1147)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentChars()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
