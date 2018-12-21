/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace } = require('ramda') // eslint-disable-line no-unused-vars

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}

const describe = justDuringTest(global.describe) // eslint-disable-line no-unused-vars
const test = justDuringTest(global.test) // eslint-disable-line no-unused-vars
const xtest = justDuringTest(global.xtest) // eslint-disable-line no-unused-vars

const LEFT = 'LEFT'
const RIGHT = 'RIGHT'
const UP = 'UP'
const DOWN = 'DOWN'
const orientationOf = {
  '<': LEFT,
  '>': RIGHT,
  '^': UP,
  'v': DOWN
}

const allCarts = /[<>v^]/
const readField = lines => ({
  hasCrash: false,
  tracks: lines.map(pipe(
    replace(/[v^]/g, '|'),
    replace(/[<>]/g, '-')
  )),
  carts: lines.flatMap((line, x) =>
    line.split('').flatMap((char, y) =>
      allCarts.test(char) ? { x, y, orientation: orientationOf[char] } : []
    )
  )
})

describe('reading the field', () => {
  const lines = [
    '/->-\\',
    '|   |  /----\\',
    '| /-+--+-\\  |',
    '| | |  | v  |',
    '\\-+-/  \\-+--/',
    '  \\------/'
  ]
  const field = readField(lines)

  it('determines the tracks on the field without carts', () => {
    expect(field.tracks).toEqual([
      '/---\\',
      '|   |  /----\\',
      '| /-+--+-\\  |',
      '| | |  | |  |',
      '\\-+-/  \\-+--/',
      '  \\------/'
    ])
  })

  it('determines the cart positions', () => {
    expect(field.carts).toEqual([
      { x: 0, y: 2, orientation: RIGHT },
      { x: 3, y: 9, orientation: DOWN }
    ])
  })

  it('has initially no crash', () => {
    expect(field.hasCrash).toBe(false)
  })
})

xtest('acceptance of nextState', () => {
  const refInput = `
/->-\\
|   |  /----\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/
  `

  const refResults = [
    `
/->-\\
|   |  /----\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/   `,
    `
/-->\\
|   |  /----\\
| /-+--+-\\  |
| | |  | |  |
\\-+-/  \\->--/
  \\------/   `,
    `
/---v
|   |  /----\\
| /-+--+-\\  |
| | |  | |  |
\\-+-/  \\-+>-/
  \\------/   `,
    `
/---\\
|   v  /----\\
| /-+--+-\\  |
| | |  | |  |
\\-+-/  \\-+->/
  \\------/   `,
    `
/---\\
|   |  /----\\
| /->--+-\\  |
| | |  | |  |
\\-+-/  \\-+--^
  \\------/   `,
    `
/---\\
|   |  /----\\
| /-+>-+-\\  |
| | |  | |  ^
\\-+-/  \\-+--/
  \\------/   `,
    `
/---\\
|   |  /----\\
| /-+->+-\\  ^
| | |  | |  |
\\-+-/  \\-+--/
  \\------/   `,
    `
/---\\
|   |  /----<
| /-+-->-\\  |
| | |  | |  |
\\-+-/  \\-+--/
  \\------/   `,
    `
/---\\
|   |  /---<\\
| /-+--+>\\  |
| | |  | |  |
\\-+-/  \\-+--/
  \\------/   `,
    `
/---\\
|   |  /--<-\\
| /-+--+-v  |
| | |  | |  |
\\-+-/  \\-+--/
  \\------/   `,
    `
/---\\
|   |  /-<--\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/   `,
    `
/---\\
|   |  /<---\\
| /-+--+-\\  |
| | |  | |  |
\\-+-/  \\-<--/
  \\------/   `,
    `
/---\\
|   |  v----\\
| /-+--+-\\  |
| | |  | |  |
\\-+-/  \\<+--/
  \\------/   `,
    `
/---\\
|   |  /----\\
| /-+--v-\\  |
| | |  | |  |
\\-+-/  ^-+--/
  \\------/   `,
    `
/---\\
|   |  /----\\
| /-+--+-\\  |
| | |  X |  |
\\-+-/  \\-+--/
  \\------/       `
  ]

  const lineIsNotEmpty = line => line.length !== 0
  const lines = refInput.split('\n').filter(lineIsNotEmpty)

  let field = readField(lines)
  while (!field.hasCrash) {
    field = field.nextTick()
    expect(field.toString()).toEqual(refResults.shift())
  }
})

const main = input => {
  const lineIsNotEmpty = line => line.length !== 0
  const lines = input.split('\n').filter(lineIsNotEmpty)

  let field = readField(lines)
  while (!field.hasCrash) { field = field.nextTick() }
  return field.crash
}

xtest('acceptance', () => {
  const refInput = `
/->-\\
|   |  /----\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/
`
  expect(main(refInput)).toBe('7,3')
})

if (process.env.NODE_ENV !== 'test') {
  const args = process.argv.slice(2)
  const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })
  const input = readFile(args[0])

  console.log(main(input))
}
