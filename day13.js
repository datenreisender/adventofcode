/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach } = require('ramda') // eslint-disable-line no-unused-vars
const fs = require('fs')
const { yellowBright, blackBright, redBright } = require('cli-color')
const { cursorHide, cursorShow, clearScreen, cursorTo } = require('ansi-escapes')
const clikey = require('clikey')

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
      if (!this.hasCrash) this.crash = { x: cart.x, y: cart.y }
      this.carts = this.carts.filter(otherCart => otherCart.x !== cart.x || otherCart.y !== cart.y)
    }
  }

  nextTick () {
    const moveCart = cart => {
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

  toString (color = false) {
    const cartColor = color ? yellowBright : identity
    const crashColor = color ? redBright : identity

    const result = clone(this.tracks)
    this.carts.forEach(cart => { result[cart.y][cart.x] = cartColor(cart.orientation.char) })
    if (this.hasCrash) result[this.crash.y][this.crash.x] = crashColor('X')

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

const sleep = () => new Promise(resolve => setTimeout(resolve, 200))

const main = async (abortPredicate, returnComputer, input, verbose = false, slow = false, pause = false) => {
  if (verbose) console.log(cursorHide + clearScreen)

  const lineIsNotEmpty = line => line.length !== 0
  const lines = input.split('\n').filter(lineIsNotEmpty)

  let field = readField(lines)
  while (!abortPredicate(field)) {
    field.crash = undefined
    if (verbose) {
      console.log(cursorTo(0, 0) + blackBright(field.toString(true)))
      console.log('Remaining carts: ' + field.carts.length)
    }

    if (slow) { await sleep() }
    if (pause) {
      const key = await clikey('Next step (x for exit)')
      if (key === 'x') process.exit()
    }
    field.nextTick()
  }
  if (verbose) { console.log(cursorTo(0, 0) + blackBright(field.toString(true)) + cursorShow) }
  return returnComputer(field)
}

const part1 = (...args) =>
  main(
    field => field.hasCrash,
    field => field.crash.x + ',' + field.crash.y,
    ...args
  )

test('acceptance of part 1', async () => {
  const refInput = `
/->-╲
|   |  /----╲
| /-+--+-╲  |
| | |  | v  |
╲-+-/  ╲-+--/
  ╲------/
`
  await expect(part1(refInput)).resolves.toBe('7,3')
})

const part2 = (...args) =>
  main(
    field => field.carts.length === 1,
    field => field.carts[0].x + ',' + field.carts[0].y,
    ...args
  )

test('acceptance of part 2', async () => {
  const refInput = `
/>-<╲
|   |
| /<+-╲
| | | v
╲>+</ |
  |   ^
  ╲<->/`
  await expect(part2(refInput)).resolves.toBe('6,4')
})

if (process.env.NODE_ENV !== 'test') {
  const input = fs.readFileSync('day13-input', { encoding: 'utf8' }).replace(/\\/g, '╲')
  const args = process.argv.slice(2)

  const verbose = args.includes('--verbose')
  const slow = args.includes('--slow')
  const pause = args.includes('--pause')

  part1(input, verbose, slow, pause).then(result => console.log('Part 1: ' + result))
  part2(input, verbose, slow, pause).then(result => console.log('Part 2: ' + result))
}
