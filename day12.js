/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip } = require('ramda') // eslint-disable-line no-unused-vars

const test = process.env.NODE_ENV === 'test' ? it : () => {}
const xtest = process.env.NODE_ENV === 'test' ? xit : () => {} // eslint-disable-line no-unused-vars

let generations = 20
// generations = 50000000000

const listToString = ({ firstPot }) => {
  let result = ''
  let current = firstPot
  let number = current.number
  while (current != null) {
    if (number !== current.number) throw (new Error(`Property violated: After ${current.prev.number} the next number is ${current.number}`))
    number++
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

const createLinkedList = stateSpec =>
  stateSpec.split('').reduce((state, currentPotState) => {
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

const ruleNode = child => ({
  state: '.',
  '.': child,
  '#': clone(child)
})
const rulesFor = ruleSpecs => {
  const rules = range(0, 6).reduce(ruleNode, undefined)
  ruleSpecs.forEach(ruleSpec => {
    const matches = /^(.)(.)(.)(.)(.) => (.)$/.exec(ruleSpec)
    rules[matches[1]][matches[2]][matches[3]][matches[4]][matches[5]].state = matches[6]
  })

  return rules
}

const readConfig = input => {
  const lineIsNotEmpty = line => line.length !== 0
  const lines = input.split('\n').filter(lineIsNotEmpty)

  const stateSpec = lines[0].substring('initial state: '.length)

  return {
    ...createLinkedList(stateSpec),
    rules: rulesFor(lines.slice(1))
  }
}

test('reading config file', () => {
  const config = readConfig(`initial state: ###..###

..#.# => #
###.# => .`)

  expect(listToString(config)).toEqual('###..###')

  expect(config.firstPot.state).toEqual('#')
  expect(config.firstPot.number).toEqual(0)
  expect(config.firstPot.next.state).toEqual('#')
  expect(config.firstPot.next.number).toEqual(1)

  expect(config.lastPot.state).toEqual('#')
  expect(config.lastPot.number).toEqual(7)
  expect(config.lastPot.prev.state).toEqual('#')
  expect(config.lastPot.prev.number).toEqual(6)

  expect(config.rules['.']['.']['#']['.']['#'].state).toBe('#')
  expect(config.rules['#']['#']['#']['.']['#'].state).toBe('.')
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
  identity,
  ...times(() => prependPot, missingEmptyPotsAtStart(state.firstPot)),
  ...times(() => appendPot, missingEmptyPotsAtEnd(state.lastPot))
)(state)

test('surround with dead', () => {
  const result = surroundWithDead(createLinkedList('.#..'))
  expect(listToString(result)).toEqual('....#....')
  expect(result.firstPot.number).toEqual(-3)
  expect(result.lastPot.number).toEqual(5)

  expect(listToString(surroundWithDead(createLinkedList('#.....')))).toEqual('....#.....')
  expect(listToString(surroundWithDead(createLinkedList('....#.....')))).toEqual('....#.....')
})

const nextPotState = rules => pot =>
  rules[pot.prev.prev.state][pot.prev.state][pot.state][pot.next.state][pot.next.next.state].state

const iterateOverMiddle = rules => {
  const nextPotStateAfter = nextPotState(rules)
  return ({ firstPot, lastPot }) => {
    let current = firstPot.next.next
    const end = lastPot.prev
    do {
      current.nextState = nextPotStateAfter(current)
      current = current.next
    } while (current !== end)

    current = firstPot
    do {
      current.state = current.nextState || current.state
      current = current.next
    } while (current != null)

    return ({ firstPot, lastPot })
  }
}

test('iterate over middle', () => {
  const rules = rulesFor([ '....# => #', '#.... => #' ])
  const input = '....#....'
  const result = iterateOverMiddle(rules)(createLinkedList(input))
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

const nextState = rules =>
  pipe(
    surroundWithDead,
    iterateOverMiddle(rules)
  )

test('acceptance of nextState', () => {
  const rules = rulesFor([ '...## => #', '..#.. => #', '.#... => #', '.#.#. => #', '.#.## => #', '.##.. => #', '.#### => #', '#.#.# => #', '#.### => #', '##.#. => #', '##.## => #', '###.. => #', '###.# => #', '####. => #' ])

  const nextStateAfter = nextState(rules)
  let result = nextStateAfter(createLinkedList('#..#.#..##......###...###'))
  expect(listToString(result)).toEqual('....#...#....#.....#..#..#..#....')

  result = nextStateAfter(createLinkedList('##..##...##....#..#..#..##'))
  expect(listToString(result)).toEqual('...#.#...#..#.#....#..#..#...#....')

  expect(listToString(nextStateAfter(result))).toEqual('.....#.#..#...#.#...#..#..##..##...')
})

const computeScore = ({ firstPot }) => {
  let sum = 0
  let current = firstPot
  while (current != null) {
    sum += current.state === '.' ? 0 : current.number
    current = current.next
  }

  return sum
}

test('compute score', () => {
  expect(computeScore(createLinkedList('.#.#')))
    .toEqual(1 + 3)
})

const main = input => {
  const config = readConfig(input)
  const nextStateAfter = nextState(config.rules)
  let state = { firstPot: config.firstPot, lastPot: config.lastPot }
  for (let i = 0; i < generations; i++) {
    state = nextStateAfter(state)
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

  console.log('Part 2:', 1023 + 186 * 50000000000)
}
