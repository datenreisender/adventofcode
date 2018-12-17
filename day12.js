/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip } = require('ramda') // eslint-disable-line no-unused-vars

const test = process.env.NODE_ENV === 'test' ? it : () => {}
const xtest = process.env.NODE_ENV === 'test' ? xit : () => {}

let generations = 20
// generations = 50000000000

const listToString = ({ firstPot }) => {
  let result = ''
  let current = firstPot
  while (current != null) {
    result += current.state
    current = current.next
  }
  return result
}

const appendPot = ({ firstPot, lastPot }, state = '.') => {
  const newPot = {
    number: lastPot.number + 1,
    state,
    prev: lastPot,
    next: undefined
  }
  lastPot.next = newPot

  return { firstPot, lastPot: newPot }
}

const prependPot = ({ firstPot, lastPot }, state = '.') => {
  const newPot = {
    number: firstPot.number - 1,
    state,
    prev: undefined,
    next: firstPot
  }
  firstPot.prev = newPot

  return { firstPot: newPot, lastPot }
}

const createLinkedList = initialState =>
  initialState.split('').reduce((state, currentPotState) => {
    if (state == null) {
      const firstPot = {
        number: 0,
        state: currentPotState,
        prev: undefined,
        next: undefined
      }
      return {
        firstPot,
        lastPot: firstPot
      }
    }

    return appendPot(state, currentPotState)
  }, null)

const readConfig = input => {
  const lineIsNotEmpty = line => line.length !== 0
  const lines = input.split('\n').filter(lineIsNotEmpty)

  const rulesFor = result =>
    lines
      .slice(1)
      .filter(contains(result))
      .map(dropLast(result.length))

  const initialState = lines[0].substring('initial state: '.length)
  return {
    initialState, // DEP
    ...createLinkedList(initialState),
    liveRules: rulesFor(' => #'),
    dieRules: rulesFor(' => .')
  }
}

test('reading config file', () => {
  const config = readConfig(`initial state: ###..###

..#.# => #
###.# => .`)

  expect(config.initialState).toEqual('###..###')
  expect(listToString(config)).toEqual('###..###')
  expect(config.liveRules).toEqual(['..#.#'])
  expect(config.dieRules).toEqual(['###.#'])

  expect(config.firstPot.state).toEqual('#')
  expect(config.firstPot.number).toEqual(0)
  expect(config.firstPot.next.state).toEqual('#')
  expect(config.firstPot.next.number).toEqual(1)

  expect(config.lastPot.state).toEqual('#')
  expect(config.lastPot.number).toEqual(7)
  expect(config.lastPot.prev.state).toEqual('#')
  expect(config.lastPot.prev.number).toEqual(6)
})

const deadCellPadding = '....'
const prependString = concat
const appendString = flip(concat)
const surroundWithDead_DEP = evolve({
  field: pipe(appendString(deadCellPadding), prependString(deadCellPadding)),
  offset: subtract(__, deadCellPadding.length)
})

const neededEmptyPotsAtBoundaries = 4
const missingEmptyPots = nextElement => boundaryPot => {
  let emptyPotsAtBoundary = 0
  let current = boundaryPot
  while (
    current != null &&
    current.state === '.' &&
    emptyPotsAtBoundary < neededEmptyPotsAtBoundaries
  ) {
    emptyPotsAtBoundary++
    current = nextElement(current)
  }

  return neededEmptyPotsAtBoundaries - emptyPotsAtBoundary
}

const missingEmptyPotsAtStart = missingEmptyPots(prop('next'))
const missingEmptyPotsAtEnd = missingEmptyPots(prop('prev'))

const surroundWithDead = state => pipe(
  ...times(() => prependPot, missingEmptyPotsAtStart(state.firstPot)),
  ...times(() => appendPot, missingEmptyPotsAtEnd(state.lastPot))
)(state)

test('surround with dead', () => {
  expect(surroundWithDead_DEP({ field: '#', offset: 0 })).toEqual({ field: '....#....', offset: -4 })
  const result = surroundWithDead(createLinkedList('.#..'))
  expect(listToString(result)).toEqual('....#....')
  expect(result.firstPot.number).toEqual(-3)
  expect(result.lastPot.number).toEqual(5)

  expect(listToString(surroundWithDead(createLinkedList('#.....')))).toEqual('....#.....')
})

const iterateOverMiddle_DEP = liveRules => evolve({
  field: field =>
    range(0, field.length - 4)
      .map(i => field.slice(i, i + 5))
      .map(slice => liveRules.includes(slice) ? '#' : '.')
      .join(''),
  offset: add(2)
})

const patternAround = current =>
  current.prev.prev.state +
  current.prev.state +
  current.state +
  current.next.state +
  current.next.next.state

const iterateOverMiddle = liveRules => ({ firstPot, lastPot }) => {
  let current = firstPot.next.next
  const end = lastPot.prev
  do {
    current.nextState = liveRules.includes(patternAround(current)) ? '#' : '.'
    current = current.next
  } while (current !== end)

  current = firstPot
  do {
    current.state = current.nextState || current.state
    current = current.next
  } while (current != null)

  return ({ firstPot, lastPot })
}

test('iterate over middle', () => {
  const liveRules = [ '....#', '#....' ]

  expect(iterateOverMiddle_DEP(liveRules)({ field: '....#....', offset: -4 }))
    .toEqual({ field: '#...#', offset: -2 })

  const input = '....#....'
  const result = iterateOverMiddle(liveRules)(createLinkedList(input))
  expect(input.length).toEqual(listToString(result).length)
  expect(listToString(result)).toEqual('..#...#..')
})

const trimDead = ({ field, offset }) => {
  const deadAtStart = /^\.*/.exec(field)[0].length
  const deadAtEnd = /\.*$/.exec(field)[0].length
  return {
    field: field.slice(deadAtStart, field.length - deadAtEnd),
    offset: offset + deadAtStart
  }
}

test('trimDead', () => {
  expect(trimDead({ field: '..#..#...', offset: -4 })).toEqual({ field: '#..#', offset: -2 })
  expect(trimDead({ field: '#..#', offset: -2 })).toEqual({ field: '#..#', offset: -2 })
})

const nextState = liveRules =>
  pipe(
    surroundWithDead_DEP,
    iterateOverMiddle_DEP(liveRules),
    trimDead
  )

test('acceptance of nextState', () => {
  const liveRules = [ '...##', '..#..', '.#...', '.#.#.', '.#.##', '.##..', '.####', '#.#.#', '#.###', '##.#.', '##.##', '###..', '###.#', '####.' ]
  const nextStateAfter = nextState(liveRules)

  expect(nextStateAfter({ field: '#..#.#..##......###...###', offset: 0 }))
    .toEqual({ field: '#...#....#.....#..#..#..#', offset: 0 })
  expect(nextStateAfter({ field: '##..##...##....#..#..#..##', offset: 0 }))
    .toEqual({ field: '#.#...#..#.#....#..#..#...#', offset: -1 })
  expect(nextStateAfter({ field: '#.#...#..#.#....#..#..#...#', offset: -1 }))
    .toEqual({ field: '#.#..#...#.#...#..#..##..##', offset: 0 })
})

const computeScore = ({ field, offset }) =>
  sum(field.split('').map((cell, index) =>
    cell === '.' ? 0 : index + offset
  ))

test('compute score', () => {
  expect(computeScore({ field: '#..#', offset: -1 }))
    .toEqual(-1 + 2)
})

const main = input => {
  const config = readConfig(input)
  let state = { field: config.initialState, offset: 0 }
  for (let i = 0; i < generations; i++) {
    state = nextState(config.liveRules)(state)
  }
  return computeScore(state)
}

const refInput = `initial state: #..#.#..##......###...###

...## => #
..#.. => #
.#... => #
.#.#. => #
.#.## => #
.##.. => #
.#### => #
#.#.# => #
#.### => #
##.#. => #
##.## => #
###.. => #
###.# => #
####. => #
`

test('acceptance', () => {
  expect(main(refInput)).toBe(325)
})

if (process.env.NODE_ENV !== 'test') {
  const args = process.argv.slice(2)
  const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })
  const input = readFile(args[0])

  console.log(main(input))
}
