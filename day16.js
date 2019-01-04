/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte } = require('ramda') // eslint-disable-line no-unused-vars

const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars } = require('./setup') // eslint-disable-line no-unused-vars

const rr = f => (registers, inputs) => f(registers[inputs[0]], registers[inputs[1]])
const ri = f => (registers, inputs) => f(registers[inputs[0]], inputs[1])
const ir = f => (registers, inputs) => f(inputs[0], registers[inputs[1]])
const r = (registers, inputs) => registers[inputs[0]]
const i = (registers, inputs) => inputs[0]

const and = (a, b) => a & b
const or = (a, b) => a | b
const greater = (a, b) => a > b ? 1 : 0
const equal = (a, b) => a === b ? 1 : 0

const addr = rr(add)
const addi = ri(add)
const mulr = rr(multiply)
const muli = ri(multiply)
const banr = rr(and)
const bani = ri(and)
const borr = rr(or)
const bori = ri(or)
const setr = r
const seti = i
const gtir = ir(greater)
const gtri = ri(greater)
const gtrr = rr(greater)
const eqir = ir(equal)
const eqri = ri(equal)
const eqrr = rr(equal)

const operations = [ addr, addi, mulr, muli, banr, bani, borr, bori, setr, seti, gtir, gtri, gtrr, eqir, eqri, eqrr ]

const invoke = curry((registers, [input1, input2, output], op) => update(output, op(registers, [input1, input2]), registers))

test('some invocations', () => {
  expect(invoke([3, 2, 1, 1], [2, 1, 2], mulr)).toEqual([3, 2, 2, 1])
  expect(invoke([3, 2, 1, 1], [2, 1, 2], addi)).toEqual([3, 2, 2, 1])
  expect(invoke([3, 2, 1, 1], [2, 1, 2], seti)).toEqual([3, 2, 2, 1])
})

const sampleRE = /Before: \[(?<registersBefore>[\d, ]+)\]\s+(?<opcode>\d+) (?<parameters>[\d ]+)\s+After:\s\s\[(?<registersAfter>[\d, ]+)\]/

const allSamples = match(RegExp(sampleRE, 'g'))
const extractGroups = pipe(match(sampleRE), prop('groups'))
const splitParameters = pipe(split(' '), map(Number))
const splitRegisters = pipe(split(', '), map(Number))
const evolveGroups = evolve({
  parameters: splitParameters,
  registersAfter: splitRegisters,
  registersBefore: splitRegisters
})
const part1 = input =>
  allSamples(input)
    .map(extractGroups)
    .map(evolveGroups)
    .map(({ parameters, registersAfter, registersBefore }) =>
      operations.map(invoke(registersBefore, parameters)).filter(equals(registersAfter)).length
    )
    .filter(gte(__, 3))
    .length

test('run two samples', () => {
  const samples = `
  Before: [3, 2, 1, 1]
  9 2 1 2
  After:  [3, 2, 2, 1]

  Before: [2, 0, 0, 1]
  15 3 1 3
  After:  [2, 0, 0, 1]


  2 2 3 2
  15 1 0 1
  `

  expect(part1(samples)).toEqual(2)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContent()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
