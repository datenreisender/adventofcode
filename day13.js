/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach } = require('ramda') // eslint-disable-line no-unused-vars

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}

const describe = justDuringTest(global.describe) // eslint-disable-line no-unused-vars
const test = justDuringTest(global.test) // eslint-disable-line no-unused-vars
const xtest = justDuringTest(global.xtest) // eslint-disable-line no-unused-vars

const horizontalTurn = (cart, trackChar) => {
  switch (trackChar) {
    case '/': cart.orientation = cart.orientation.clock.clock.clock; break
    case '╲': cart.orientation = cart.orientation.clock; break
    case '+': cart.intersectionTurn(); break
  }
}

const verticalTurn = (cart, trackChar) => {
  switch (trackChar) {
    case '/': cart.orientation = cart.orientation.clock; break
    case '╲': cart.orientation = cart.orientation.clock.clock.clock; break
    case '+': cart.intersectionTurn(); break
  }
}

const LEFT = {
  char: '<',
  move: cart => cart.x--,
  turn: horizontalTurn
}
const RIGHT = {
  char: '>',
  move: cart => cart.x++,
  turn: horizontalTurn
}
const UP = {
  char: '^',
  move: cart => cart.y--,
  turn: verticalTurn
}
const DOWN = {
  char: 'v',
  move: cart => cart.y++,
  turn: verticalTurn
}
const allOrientations = [LEFT, UP, RIGHT, DOWN]
LEFT.clock = UP
UP.clock = RIGHT
RIGHT.clock = DOWN
DOWN.clock = LEFT

const orientationOf = char => allOrientations.find(propEq('char', char))

const COUNTERCLOCK = cart => {
  cart.orientation = cart.orientation.clock.clock.clock
  cart.nextIntersectionTurn = STRAIGHT
}
const STRAIGHT = cart => {
  cart.nextIntersectionTurn = CLOCK
}
const CLOCK = cart => {
  cart.orientation = cart.orientation.clock
  cart.nextIntersectionTurn = COUNTERCLOCK
}

const allCarts = /[<>v^]/
class Field {
  constructor (lines) {
    this.tracks = lines.map(pipe(
      replace(/[v^]/g, '|'),
      replace(/[<>]/g, '-'),
      split('')
    ))
    this.carts = lines.flatMap((line, y) =>
      line.split('').flatMap((char, x) =>
        allCarts.test(char) ? {
          x,
          y,
          orientation: orientationOf(char),
          nextIntersectionTurn: COUNTERCLOCK,
          intersectionTurn () { this.nextIntersectionTurn(this) }
        } : []
      )
    )
  }

  get hasCrash () {
    return this.crash != null
  }

  checkForCrash (cart) {
    const justCoordinates = props(['x', 'y'])
    const hasCrash = this.carts
      .map(justCoordinates)
      .filter(equals(justCoordinates(cart)))
      .length > 1

    if (hasCrash) {
      this.crash = { x: cart.x, y: cart.y }
    }
  }

  nextTick () {
    const moveCart = cart => {
      if (this.hasCrash) return

      cart.orientation.move(cart)
      cart.orientation.turn(cart, this.tracks[cart.y][cart.x])
      this.checkForCrash(cart)
    }

    pipe(
      sortBy(prop('y')),
      sortBy(prop('x')),
      forEach(moveCart)
    )(this.carts)
  }

  toString () {
    const result = clone(this.tracks)
    this.carts.forEach(cart => { result[cart.y][cart.x] = cart.orientation.char })
    if (this.hasCrash) result[this.crash.y][this.crash.x] = 'X'

    return result.map(join('')).join('\n')
  }
}
const readField = lines => new Field(lines)
describe('reading the field', () => {
  const lines = [
    '/->-╲',
    '|   |  /----╲',
    '| /-+--+-╲  |',
    '| | |  | v  |',
    '╲-+-/  ╲-+--/',
    '  ╲------/'
  ]
  const field = readField(lines)

  it('determines the tracks on the field without carts', () => {
    expect(field.tracks).toEqual([
      '/---╲'.split(''),
      '|   |  /----╲'.split(''),
      '| /-+--+-╲  |'.split(''),
      '| | |  | |  |'.split(''),
      '╲-+-/  ╲-+--/'.split(''),
      '  ╲------/'.split('')
    ])
  })

  it('determines the cart positions', () => {
    expect(field.carts).toEqual([
      expect.objectContaining({ x: 2, y: 0, orientation: RIGHT }),
      expect.objectContaining({ x: 9, y: 3, orientation: DOWN })
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

    expect(fieldAfterATick('|', 'v', '|')).toEqual(['|', '|', 'v'].join('\n'))
    expect(fieldAfterATick('|', '^', '|')).toEqual(['^', '|', '|'].join('\n'))
  })

  it('turns on a simple corner', () => {
    expect(fieldAfterATick('>/')).toEqual('-^')
    expect(fieldAfterATick('>╲')).toEqual('-v')

    expect(fieldAfterATick('/<')).toEqual('v-')
    expect(fieldAfterATick('╲<')).toEqual('^-')

    expect(fieldAfterATick('v', '/')).toEqual(['|', '<'].join('\n'))
    expect(fieldAfterATick('v', '╲')).toEqual(['|', '>'].join('\n'))

    expect(fieldAfterATick('/', '^')).toEqual(['>', '|'].join('\n'))
    expect(fieldAfterATick('╲', '^')).toEqual(['<', '|'].join('\n'))
  })

  it('turns correctly on an intersection', () => {
    const field = readField([
      'v',
      '+++',
      '  +'
    ])
    field.nextTick()
    expect(field.toString()).toEqual([
      '|',
      '>++',
      '  +'].join('\n'))
    field.nextTick()
    expect(field.toString()).toEqual([
      '|',
      '+>+',
      '  +'].join('\n'))
    field.nextTick()
    expect(field.toString()).toEqual([
      '|',
      '++v',
      '  +'].join('\n'))
    field.nextTick()
    expect(field.toString()).toEqual([
      '|',
      '+++',
      '  >'].join('\n'))
  })

  it('crashes when two carts meet', () => {
    const field = readField(['>+', ' ^'])
    field.nextTick()
    expect(field.toString()).toEqual(['-X', ' |'].join('\n'))
    expect(field.hasCrash).toEqual(true)
    expect(field.crash).toEqual({ x: 1, y: 0 })
  })
  it('evaluates cart movements in the right order', () => {
    expect(fieldAfterATick('>>-')).toEqual('-X-')
    expect(fieldAfterATick('-<<')).toEqual('<<-')
    expect(fieldAfterATick('v', 'v', '|')).toEqual(['|', 'X', '|'].join('\n'))
    expect(fieldAfterATick('|', '^', '^')).toEqual(['^', '^', '|'].join('\n'))

    const field = readField([
      '-+--<',
      ' ╲<'
    ])
    field.nextTick()
    field.nextTick()
    field.nextTick()
    expect(field.toString()).toEqual(
      [
        '<v---',
        ' ╲-'
      ].join('\n')
    )
  })
})

test('acceptance of nextState', () => {
  const refInput = `
/->-╲
|   |  /----╲
| /-+--+-╲  |
| | |  | v  |
╲-+-/  ╲-+--/
  ╲------/
`

  const refResults = [
    `
/-->╲
|   |  /----╲
| /-+--+-╲  |
| | |  | |  |
╲-+-/  ╲->--/
  ╲------/`,
    `
/---v
|   |  /----╲
| /-+--+-╲  |
| | |  | |  |
╲-+-/  ╲-+>-/
  ╲------/`,
    `
/---╲
|   v  /----╲
| /-+--+-╲  |
| | |  | |  |
╲-+-/  ╲-+->/
  ╲------/`,
    `
/---╲
|   |  /----╲
| /->--+-╲  |
| | |  | |  |
╲-+-/  ╲-+--^
  ╲------/`,
    `
/---╲
|   |  /----╲
| /-+>-+-╲  |
| | |  | |  ^
╲-+-/  ╲-+--/
  ╲------/`,
    `
/---╲
|   |  /----╲
| /-+->+-╲  ^
| | |  | |  |
╲-+-/  ╲-+--/
  ╲------/`,
    `
/---╲
|   |  /----<
| /-+-->-╲  |
| | |  | |  |
╲-+-/  ╲-+--/
  ╲------/`,
    `
/---╲
|   |  /---<╲
| /-+--+>╲  |
| | |  | |  |
╲-+-/  ╲-+--/
  ╲------/`,
    `
/---╲
|   |  /--<-╲
| /-+--+-v  |
| | |  | |  |
╲-+-/  ╲-+--/
  ╲------/`,
    `
/---╲
|   |  /-<--╲
| /-+--+-╲  |
| | |  | v  |
╲-+-/  ╲-+--/
  ╲------/`,
    `
/---╲
|   |  /<---╲
| /-+--+-╲  |
| | |  | |  |
╲-+-/  ╲-<--/
  ╲------/`,
    `
/---╲
|   |  v----╲
| /-+--+-╲  |
| | |  | |  |
╲-+-/  ╲<+--/
  ╲------/`,
    `
/---╲
|   |  /----╲
| /-+--v-╲  |
| | |  | |  |
╲-+-/  ^-+--/
  ╲------/`,
    `
/---╲
|   |  /----╲
| /-+--+-╲  |
| | |  X |  |
╲-+-/  ╲-+--/
  ╲------/`
  ].map(replace(/^\n/, ''))

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
  return field.crash.x + ',' + field.crash.y
}

test('acceptance', () => {
  const refInput = `
/->-╲
|   |  /----╲
| /-+--+-╲  |
| | |  | v  |
╲-+-/  ╲-+--/
  ╲------/
`
  expect(main(refInput)).toBe('7,3')
})

if (process.env.NODE_ENV !== 'test') {
  const args = process.argv.slice(2)
  const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })
  const input = readFile(args[0]).replace(/╲/g, '╲')

  console.log(main(input))
}
