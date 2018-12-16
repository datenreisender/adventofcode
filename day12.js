/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip } = require('ramda') // eslint-disable-line no-unused-vars

const test = process.env.NODE_ENV === 'test' ? it : () => {}
const xtest = process.env.NODE_ENV === 'test' ? xit : () => {}

const readConfig = input => {
  const lineIsNotEmpty = line => line.length !== 0
  const lines = input.split('\n').filter(lineIsNotEmpty)

  const rulesFor = result =>
    lines
      .slice(1)
      .filter(contains(result))
      .map(dropLast(result.length))

  return {
    initialState: lines[0].substring('initial state: '.length),
    liveRules: rulesFor(' => #'),
    dieRules: rulesFor(' => .')
  }
}

test('reading config file', () => {
  const config = readConfig(`initial state: ###..###

..#.# => #
###.# => .`)

  expect(config.initialState).toEqual('###..###')
  expect(config.liveRules).toEqual(['..#.#'])
  expect(config.dieRules).toEqual(['###.#'])
})

const deadCellPadding = '....'
const prependString = concat
const appendString = flip(concat)
const surroundWithDead = evolve({
  field: pipe(appendString(deadCellPadding), prependString(deadCellPadding)),
  offset: subtract(__, deadCellPadding.length)
})

test('surround with dead', () => {
  expect(surroundWithDead({ field: '#', offset: 0 })).toEqual({ field: '....#....', offset: -4 })
})

const iterateOverMiddle = liveRules => evolve({
  field: field =>
    range(0, field.length - 4)
      .map(i => field.slice(i, i + 5))
      .map(slice => liveRules.includes(slice) ? '#' : '.')
      .join(''),
  offset: add(2)
})

test('iterate over middle', () => {
  const liveRules = [ '....#', '#....' ]

  expect(iterateOverMiddle(liveRules)({ field: '....#....', offset: -4 }))
    .toEqual({ field: '#...#', offset: -2 })
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
    surroundWithDead,
    iterateOverMiddle(liveRules),
    trimDead
  )

xtest('acceptance of nextState', () => {
  const liveRules = [ '...##', '..#..', '.#...', '.#.#.', '.#.##', '.##..', '.####', '#.#.#', '#.###', '##.#.', '##.##', '###..', '###.#', '####.' ]
  const nextStateAfter = nextState(liveRules)

  expect(nextStateAfter({ field: '#..#.#..##......###...###', offset: 0 }))
    .toEqual({ field: '#...#....#.....#..#..#..#', offset: 0 })
  expect(nextStateAfter({ field: '##..##...##....#..#..#..##', offset: 0 }))
    .toEqual({ field: '#.#...#..#.#....#..#..#...#', offset: -1 })
  expect(nextStateAfter({ field: '#.#...#..#.#....#..#..#...#', offset: -1 }))
    .toEqual({ field: '#.#..#...#.#...#..#..##..##', offset: 0 })
})

const computeScore = TODO => TODO

const main = input => {
  const config = readConfig(input)
  const finalState = reduce(nextState(config.liveRules), { field: config.initialState, offset: 0 }, range(1, 20))
  return computeScore(finalState)
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

xtest('acceptance', () => {
  expect(main(refInput)).toBe(325)
})

if (process.env.NODE_ENV !== 'test') {
  const args = process.argv.slice(2)
  const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })
  const input = readFile(args[0])

  console.log(main(input))
}
