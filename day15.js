/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse } = require('ramda') // eslint-disable-line no-unused-vars

const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars } = require('./setup') // eslint-disable-line no-unused-vars

const isWall = pathEq(['value'], '#')
const parse = spec => {
  const field = spec.map(map((value) => ({ value })))

  field.forEach((row, y) => {
    row.forEach((cell, x) => {
      cell.x = x
      cell.y = y
      cell.above = path([y - 1, x], field)
      cell.below = path([y + 1, x], field)
      cell.left = path([y, x - 1], field)
      cell.right = path([y, x + 1], field)
      const allNeighbors = [cell.above, cell.below, cell.left, cell.right]
      cell.neighbors = reject(isWall, allNeighbors)
    })
  })

  return field
}
const toString = field =>
  field.map(row =>
    row.map(prop('value')).join('')
  ).join('\n')

test('parsing and printing the field', () => {
  const input = `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`

  const parsed = parse(inputContentChars(input))
  expect(toString(parsed)).toEqual(input.trim())
})

const enemyOf = cell => cell.value === 'G' ? 'E' : 'G'
const hasNeighboring = sought => cell =>
  cell.neighbors.map(prop('value')).includes(sought)

const sortInReadingOrder = sortWith([ ascend(prop('y')), ascend(prop('x')) ])

test('sorting in reading order', () => {
  const elementsInOrder = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ]

  expect(sortInReadingOrder(elementsInOrder)).toEqual(elementsInOrder)
  expect(sortInReadingOrder(reverse(elementsInOrder))).toEqual(elementsInOrder)
})

const floodSeach = (start, predicate) => {
  if (predicate(start)) return start

  const known = []
  let frontier = [start]
  let found = []
  do {
    known.push(...frontier)
    frontier = compose(
      uniq,
      reject(cell => known.includes(cell)),
      chain(prop('neighbors'))
    )(frontier)

    found = frontier.filter(predicate)
  } while (isEmpty(found) && !isEmpty(frontier))

  return sortInReadingOrder(found)[0]
}

const targetFor = (start) => floodSeach(start, hasNeighboring(enemyOf(start)))

test('choosing target for movement', () => {
  const input = `
#######
#E..G.#
#...#.#
#.G.#G#
#######`
  const field = parse(inputContentChars(input))
  const elf = field[1][1]
  expect(targetFor(elf)).toMatchObject({ x: 3, y: 1 })
})

const part1 = TODO

xtest('acceptance of part 1', () => require('./day15-testAcceptanceOfPart1')(part1))

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentChars()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
