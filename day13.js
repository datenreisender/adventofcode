/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip } = require('ramda') // eslint-disable-line no-unused-vars

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}

const describe = justDuringTest(global.describe) // eslint-disable-line no-unused-vars
const test = justDuringTest(global.test) // eslint-disable-line no-unused-vars
const xtest = justDuringTest(global.xtest) // eslint-disable-line no-unused-vars

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
