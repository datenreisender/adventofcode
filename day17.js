/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys } = require('ramda') // eslint-disable-line no-unused-vars

const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars, lines } = require('./setup') // eslint-disable-line no-unused-vars

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

const contained = (cells, cell) => cells.some(c => c.x === cell.x && c.y === cell.y)

const parseSpec = spec => {
  const walls = spec.flatMap(parseLine)
  const wet = []
  const water = []
  const minX = Math.min(...walls.map(prop('x')))
  const maxX = Math.max(...walls.map(prop('x')))
  const minY = Math.min(...walls.map(prop('y')))
  const maxY = Math.max(...walls.map(prop('y')))

  const cellString = ({ x, y }) => `${x}, ${String(y).padStart(String(maxY).length)}`
  const allWater = () => new Set(wet.concat(water).map(cellString))

  const cellToString = y => x =>
    contained(walls, { x, y }) ? '#'
      : contained(water, { x, y }) ? '~'
        : contained(wet, { x, y }) ? '|'
          : '.'
  const fieldToString = () => range(minY, maxY + 1).map(y =>
    range(minX, maxX + 1).map(cellToString(y)).join('')
  ).join('\n')
  const toString = () => `Upper left is ${[minX, minY]}, lower right is ${[maxX, maxY]}\n${fieldToString()}`

  return {
    walls,
    addWet: cell => wet.push(cell),
    addWater: cell => water.push(cell),
    isFree: cell => cell.y <= maxY && !contained(walls, cell) && !contained(water, cell),
    spring: [{ x: 500, y: minY }],
    isGround: ({ y }) => y === maxY,
    countWater: () => allWater().size,
    allWater,
    toString
  }
}

const cellBelow = cell => ({ x: cell.x, y: cell.y + 1 })
const cellAbove = cell => ({ x: cell.x, y: cell.y - 1 })
const cellLeft = cell => ({ x: cell.x - 1, y: cell.y })
const cellRight = cell => ({ x: cell.x + 1, y: cell.y })

const trickleDownOne = field => waterSource => {
  let current = waterSource
  while (field.isFree(cellBelow(current))) {
    current = cellBelow(current)
    field.addWet(current)
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
    allCells.forEach(hasDrainage ? field.addWet : field.addWater)
    result = leftDrainage.concat(rightDrainage)

    current = cellAbove(current)
  } while (!hasDrainage)
  return result
}
const fillUp = (field, waterBottoms) =>
  waterBottoms.flatMap(fillUpOne(field))

const part1 = spec => {
  const field = parseSpec(spec)
  let waterSources = [field.spring]
  while (waterSources.length > 0) {
    const waterBottoms = trickleDown(field, waterSources)
    waterSources = fillUp(field, waterBottoms)
    //    console.log(field.toString())
  }

  return field.countWater()
}

test('acceptance of part 1', () => {
  const input = `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504`
  expect(part1(lines(input))).toBe(57)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentLines()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
