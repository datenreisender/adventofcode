/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars } = require('./setup') // eslint-disable-line no-unused-vars

const { inverse } = require('cli-color')

class Creature {
  constructor (cell) {
    this.cell = cell
    this.char = cell.value
    this.hitpoints = 200
  }

  get x () { return this.cell.x }
  get y () { return this.cell.y }
}

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
      cell.creature = ['E', 'G'].includes(cell.value) ? new Creature(cell) : undefined
      cell.char = isWall(cell) ? '#' : '.'
    })
  })

  field.allCells = field.flat(1)
  field.allCreatures = field.allCells.filter(cell => cell.creature != null).map(prop('creature'))

  return field
}
const toString = (field, highlighted = []) =>
  field.map(row =>
    row.map(cell => {
      const formatter = highlighted.includes(cell) ? inverse : identity

      return formatter(cell.creature != null ? cell.creature.char : cell.char)
    }).join('')
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

const areEnemies = curry((creature, otherCell) =>
  otherCell.creature != null && creature.char !== otherCell.creature.char)

const sortInReadingOrder = sortWith([ ascend(prop('y')), ascend(prop('x')) ])
const sortInAttackOrder = sortWith([ ascend(path(['creature', 'hitpoints'])), ascend(prop('y')), ascend(prop('x')) ])

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

const targetFor = creature => floodSeach(creature.cell, hasNeighboring(areEnemies(creature)))
const moveTargetFor = (creatureCell, target) => floodSeach(target, hasNeighboring(identical(creatureCell)))

const hasNeighboring = sought => cell => cell.neighbors.some(sought)

const floodSeach = (start, predicate) => {
  if (predicate(start)) return start

  const known = []
  let frontier = [start]
  let found = []
  do {
    known.push(...frontier)
    frontier = compose(
      uniq,
      reject(cell => known.includes(cell) || cell.creature != null),
      chain(prop('neighbors'))
    )(frontier)

    found = frontier.filter(predicate)
  } while (isEmpty(found) && !isEmpty(frontier))

  return sortInReadingOrder(found)[0]
}

test('choosing target for movement', () => {
  const input = `
#######
#E..G.#
#...#.#
#.G.#G#
#######`
  const field = parse(inputContentChars(input))
  const elf = field[1][1].creature
  expect(targetFor(elf)).toMatchObject({ x: 3, y: 1 })
})

const move = (creature, cell) => {
  creature.cell.creature = undefined
  creature.cell = cell
  cell.creature = creature
}

const attack = creature => {
  const enemyNeighbors = creature.cell.neighbors.filter(areEnemies(creature))
  const attackTarget = sortInAttackOrder(enemyNeighbors)[0]
  if (attackTarget != null) {
    attackTarget.creature.hitpoints -= 3
    if (attackTarget.creature.hitpoints <= 0) {
      attackTarget.creature.cell.creature = undefined
    }
  }
}

const remainingEnemies = (allCreatures, one) => {
  const alive = allCreatures.filter(c => c.hitpoints > 0)
  return alive.some(other => areEnemies(one, other.cell))
}

const nextTick = field => {
  let roundAborted = false

  sortInReadingOrder(field.allCreatures).forEach(
    creature => {
      if (creature.hitpoints <= 0) return
      if (!remainingEnemies(field.allCreatures, creature)) {
        roundAborted = true
        return
      }
      const target = targetFor(creature)
      if (target != null && target !== creature.cell) {
        move(creature, moveTargetFor(creature.cell, target))
      }
      attack(creature)
    }
  )

  return !roundAborted
}

test('moving all creatures', () => {
  const input = `
#######
#.E...#
#.....#
#...G.#
#######`
  const result = `
#######
#..E..#
#...G.#
#.....#
#######`
  const field = parse(inputContentChars(input))
  nextTick(field)
  expect(toString(field)).toEqual(result.trim())
})

test('creature death', () => {
  const input = `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`
  const result = `
#######
#...G.#
#..G.G#
#.#.#G#
#...#E#
#.....#
#######`
  const field = parse(inputContentChars(input))
  times(() => nextTick(field), 23)
  expect(toString(field)).toEqual(result.trim())
})

const hitpoints = pipe(
  prop('allCreatures'),
  map(prop('hitpoints')),
  filter(gt(__, 0)),
  sum
)

const part1 = input => {
  const field = parse(input)
  let rounds = 0
  while (nextTick(field)) {
    rounds++
  }

  return rounds * hitpoints(field)
}

test('acceptance of part 1', () => require('./day15-testAcceptanceOfPart1')(part1))

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentChars()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
