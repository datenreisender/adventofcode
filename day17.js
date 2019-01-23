/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars, lines } = require('./setup') // eslint-disable-line no-unused-vars

const { inverse } = require('cli-color')

const specLine = /(.)=(\d+), .=(\d+)\.\.(\d+)/
const parseLine = line => {
  const [ , fixedType, fixed, rangeStart, rangeEnd ] = line.match(specLine)
  const variableType = fixedType === 'x' ? 'y' : 'x'
  return range(Number(rangeStart), Number(rangeEnd) + 1).map(variable => ({
    [fixedType]: Number(fixed),
    [variableType]: variable
  }))
}
test('parse line', () => {
  expect(parseLine('x=498, y=2..4')).toEqual([{ x: 498, y: 2 }, { x: 498, y: 3 }, { x: 498, y: 4 }])
})

const state = {
  empty: '.',
  wall: '#',
  wet: '|',
  water: '~'
}

const parseSpec = spec => {
  const walls = spec.flatMap(parseLine)
  const minX = Math.min(...walls.map(prop('x'))) - 1
  const maxX = Math.max(...walls.map(prop('x'))) + 1
  const minY = Math.min(...walls.map(prop('y')))
  const maxY = Math.max(...walls.map(prop('y')))

  const offsetX = minX
  const offsetY = minY
  const sizeX = maxX - offsetX + 1
  const sizeY = maxY - offsetY + 1

  const createEmptyRow = () => new Array(sizeX).fill(state.empty)
  const field = times(createEmptyRow, sizeY)
  walls.forEach(({ x, y }) => { field[y - offsetY][x - offsetX] = state.wall })

  const isWatery = contains(__, [state.wet, state.water])
  const isWater = equals(state.water)

  const fieldToString = (highlights = []) =>
    field.map((row, y) => row.map((cell, x) =>
      contains({ x, y }, highlights) ? inverse(cell) : cell
    ).join('')).join('\n')

  const toString = (highlights) => `Upper left is ${[minX, minY]}, lower right is ${[maxX, maxY]}\n${fieldToString(highlights)}`

  return {
    field,
    wet: ({ x, y }) => { field[y][x] = state.wet },
    water: ({ x, y }) => { field[y][x] = state.water },
    isFree: ({ x, y }) => y <= sizeY - 1 && [state.empty, state.wet].includes(field[y][x]),
    spring: [{ x: 500 - offsetX, y: minY - offsetY }],
    isGround: ({ y }) => y === sizeY - 1,
    wateryFieldCount: () => field.flat().filter(isWatery).length,
    waterFieldCount: () => field.flat().filter(isWater).length,
    toString
  }
}

test('acceptance of parseSpec', () => {
  const expectedField = `
Upper left is 494,1, lower right is 507,13
............#.
.#..#.......#.
.#..#..#......
.#..#..#......
.#.....#......
.#.....#......
.#######......
..............
..............
....#.....#...
....#.....#...
....#.....#...
....#######...
  `.trim()

  expect(parseSpec(lines(acceptanceTestSpec)).toString()).toEqual(expectedField)
})

const cellBelow = cell => ({ x: cell.x, y: cell.y + 1 })
const cellAbove = cell => ({ x: cell.x, y: cell.y - 1 })
const cellLeft = cell => ({ x: cell.x - 1, y: cell.y })
const cellRight = cell => ({ x: cell.x + 1, y: cell.y })

const trickleDownOne = field => waterSource => {
  let current = waterSource
  while (field.isFree(cellBelow(current))) {
    current = cellBelow(current)
    field.wet(current)
  }

  return field.isGround(current) ? [] : current
}

const trickleDown = (field, waterSources) =>
  waterSources.flatMap(trickleDownOne(field))

const fill = next => (field, cell) => {
  let current = cell
  const cells = []
  while (!field.isFree(cellBelow(current)) && field.isFree(next(current))) {
    current = next(current)
    cells.push(current)
  }

  return [cells, field.isFree(cellBelow(current)) ? [current] : []]
}
const fillLeft = fill(cellLeft)
const fillRight = fill(cellRight)

const fillUpOne = field => waterBottom => {
  let hasDrainage, result
  let current = waterBottom
  do {
    const [leftCells, leftDrainage] = fillLeft(field, current)
    const [rightCells, rightDrainage] = fillRight(field, current)
    hasDrainage = leftDrainage.length === 1 || rightDrainage.length === 1
    const allCells = leftCells.concat(rightCells, current)
    allCells.forEach(hasDrainage ? field.wet : field.water)
    result = leftDrainage.concat(rightDrainage)

    current = cellAbove(current)
  } while (!hasDrainage)
  return result
}
const fillUp = (field, waterBottoms) =>
  waterBottoms.flatMap(fillUpOne(field))

const simulate = spec => {
  const field = parseSpec(spec)
  let waterSources = [field.spring]
  while (waterSources.length > 0) {
    const waterBottoms = trickleDown(field, waterSources)
    waterSources = uniq(fillUp(field, waterBottoms))
    // console.log(field.toString(waterSources.concat(waterBottoms)))
  }

  // console.log(field.toString())
  return field
}

const part1 = spec => simulate(spec).wateryFieldCount()
const part2 = spec => simulate(spec).waterFieldCount()

const acceptanceTestSpec = `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504`
test('acceptance of part 1', () => {
  expect(part1(lines(acceptanceTestSpec))).toBe(57)
})
test('acceptance of part 2', () => {
  expect(part2(lines(acceptanceTestSpec))).toBe(29)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentLines()
  console.log('Part 1: ' + part1(input))
  console.log('Part 2: ' + part2(input))
}
