/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join } = require('ramda') // eslint-disable-line no-unused-vars

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}

const describe = justDuringTest(global.describe) // eslint-disable-line no-unused-vars
const test = justDuringTest(global.test) // eslint-disable-line no-unused-vars
const xtest = justDuringTest(global.xtest) // eslint-disable-line no-unused-vars

const horizontalTurn = (cart, trackChar) => {
  switch (trackChar) {
    case '/': cart.orientation = cart.orientation.clock.clock.clock; break
    case '\\': cart.orientation = cart.orientation.clock; break
  }
}

const verticalTurn = (cart, trackChar) => {
  switch (trackChar) {
    case '/': cart.orientation = cart.orientation.clock; break
    case '\\': cart.orientation = cart.orientation.clock.clock.clock; break
  }
}

const LEFT = {
  char: '<',
  move: cart => cart.y--,
  turn: horizontalTurn
}
const RIGHT = {
  char: '>',
  move: cart => cart.y++,
  turn: horizontalTurn
}
const UP = {
  char: '^',
  move: cart => cart.x--,
  turn: verticalTurn
}
const DOWN = {
  char: 'v',
  move: cart => cart.x++,
  turn: verticalTurn
}
const allOrientations = [LEFT, UP, RIGHT, DOWN]
LEFT.clock = UP
UP.clock = RIGHT
RIGHT.clock = DOWN
DOWN.clock = LEFT

const orientationOf = char => allOrientations.find(propEq('char', char))

const allCarts = /[<>v^]/
class Field {
  constructor (lines) {
    this.hasCrash = false
    this.tracks = lines.map(pipe(
      replace(/[v^]/g, '|'),
      replace(/[<>]/g, '-'),
      split('')
    ))
    this.carts = lines.flatMap((line, x) =>
      line.split('').flatMap((char, y) =>
        allCarts.test(char) ? { x, y, orientation: orientationOf(char) } : []
      )
    )
  }

  nextTick () {
    this.carts.forEach(cart => {
      cart.orientation.move(cart)
      cart.orientation.turn(cart, this.tracks[cart.x][cart.y])
    })
  }

  toString () {
    const result = clone(this.tracks)
    this.carts.forEach(cart => { result[cart.x][cart.y] = cart.orientation.char })
    if (this.hasCrash) result[this.crash.x][this.crash.y] = 'X'

    return result.map(join('')).join('\n')
  }
}
const readField = lines => new Field(lines)
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
      '/---\\'.split(''),
      '|   |  /----\\'.split(''),
      '| /-+--+-\\  |'.split(''),
      '| | |  | |  |'.split(''),
      '\\-+-/  \\-+--/'.split(''),
      '  \\------/'.split('')
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

describe('computing the next tick', () => {
  const fieldAfterATick = (...startField) => {
    const field = readField(startField)
    field.nextTick()
    return field.toString()
  }

  it('moves a cart forward', () => {
    expect(fieldAfterATick('->-')).toEqual('-->')
    expect(fieldAfterATick('-<-')).toEqual('<--')

    expect(fieldAfterATick('|', 'v', '|')).toEqual('|\n|\nv')
    expect(fieldAfterATick('|', '^', '|')).toEqual('^\n|\n|')
  })

  it('turns on a simple corner', () => {
    expect(fieldAfterATick('>/')).toEqual('-^')
    expect(fieldAfterATick('>\\')).toEqual('-v')

    expect(fieldAfterATick('/<')).toEqual('v-')
    expect(fieldAfterATick('\\<')).toEqual('^-')

    expect(fieldAfterATick('v', '/')).toEqual('|\n<')
    expect(fieldAfterATick('v', '\\')).toEqual('|\n>')

    expect(fieldAfterATick('/', '^')).toEqual('>\n|')
    expect(fieldAfterATick('\\', '^')).toEqual('<\n|')
  })

  xit('turns correctly on an intersection', () => {})
  xit('crashes when two carts meet', () => {})
  xit('evaluates cart movements in the right order', () => {})
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
    field.nextTick()
    expect(field.toString()).toEqual(refResults.shift())
  }
})

const main = input => {
  const lineIsNotEmpty = line => line.length !== 0
  const lines = input.split('\n').filter(lineIsNotEmpty)

  let field = readField(lines)
  while (!field.hasCrash) { field.nextTick() }
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
