/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys, xprod, T } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars, lines, chars } = require('./setup') // eslint-disable-line no-unused-vars
const { between } = require('ramda-extension')

const { operations, invoke } = require('./operations')

const acceptanceInput = [
  '#ip 0',
  'seti 5 0 1',
  'seti 6 0 2',
  'addi 0 1 0',
  'addr 1 2 3',
  'setr 1 0 0',
  'seti 8 0 4',
  'seti 9 0 5'
]

const parse = ([instructionPointerRegisterSpec, ...programSpec]) => ({
  instructionPointerRegister: Number(last(instructionPointerRegisterSpec)),
  program: programSpec
    .map(split(' '))
    .map(([operation, ...registers]) => [registers.map(Number), operations[operation]])
})

test('acceptance of parse', () => {
  expect(parse(acceptanceInput)).toEqual({
    instructionPointerRegister: 0,
    program: [
      [[5, 0, 1], operations.seti],
      [[6, 0, 2], operations.seti],
      [[0, 1, 0], operations.addi],
      [[1, 2, 3], operations.addr],
      [[1, 0, 0], operations.setr],
      [[8, 0, 4], operations.seti],
      [[9, 0, 5], operations.seti]
    ]
  })
})

const isInProgram = (program, instructionPointer) =>
  between(0, program.length - 1, instructionPointer)

const part1 = input => {
  const { program, instructionPointerRegister } = parse(input)

  let registers = new Array(6).fill(0)
  let instructionPointer = 0

  do {
    registers[instructionPointerRegister] = instructionPointer
    registers = invoke(registers, ...program[instructionPointer])
    instructionPointer = registers[instructionPointerRegister] + 1
  } while (isInProgram(program, instructionPointer))

  return registers[0]
}

test('acceptance of part 1', () => {
  expect(part1(acceptanceInput)).toBe(6)
})

if (process.env.NODE_ENV !== 'test') {
  const input = inputContentLines()
  console.log('Part 1: ' + part1(input))
  // console.log('Part 2: ' + part2(input))
}
