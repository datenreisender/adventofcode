/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach, last, map, path, pathEq, reject, compose, uniq, chain, sortWith, ascend, reverse, identical, filter, gt, curry, pluck, without, update, multiply, match, gte, keys } = require('ramda') // eslint-disable-line no-unused-vars
const { describe, test, xtest, TODO, inputContent, inputContentLines, inputContentChars } = require('./setup') // eslint-disable-line no-unused-vars

const { operations, invoke } = require('./operations')

const sampleRE = /Before: \[(?<registersBefore>[\d, ]+)\]\s+(?<opcode>\d+) (?<parameters>[\d ]+)\s+After:\s\s\[(?<registersAfter>[\d, ]+)\]/

const allSamples = match(RegExp(sampleRE, 'g'))
const extractGroups = pipe(match(sampleRE), prop('groups'))
const splitParameters = pipe(split(' '), map(Number))
const splitRegisters = pipe(split(', '), map(Number))
const evolveGroups = evolve({
  parameters: splitParameters,
  registersAfter: splitRegisters,
  registersBefore: splitRegisters,
  opcode: Number
})
const part1 = input =>
  allSamples(input)
    .map(extractGroups)
    .map(evolveGroups)
    .map(({ parameters, registersAfter, registersBefore }) =>
      values(operations)
        .map(invoke(registersBefore, parameters))
        .filter(equals(registersAfter))
        .length
    )
    .filter(gte(__, 3))
    .length

const part2 = input => {
  const possibleOpcodes = map(() => range(0, 16), operations)

  allSamples(input)
    .map(extractGroups)
    .map(evolveGroups)
    .map(({ opcode, parameters, registersAfter, registersBefore }) =>
      keys(operations).forEach(opname => {
        const operationResuls = invoke(registersBefore, parameters, operations[opname])
        if (!equals(operationResuls, registersAfter)) {
          possibleOpcodes[opname] = without([opcode], possibleOpcodes[opname])
        }
      })
    )

  const opByCode = []

  while (!isEmpty(possibleOpcodes)) {
    const determinedOpCodes = toPairs(possibleOpcodes).filter(([_, opcodes]) => opcodes.length === 1)
    determinedOpCodes.forEach(([opname, opcodes]) => {
      opByCode[opcodes[0]] = operations[opname]
      opByCode[opcodes[0]].opname = opname
      delete possibleOpcodes[opname]
    })
    keys(possibleOpcodes).forEach(opname => {
      possibleOpcodes[opname] = without(determinedOpCodes.map(([_, opcodes]) => opcodes[0]), possibleOpcodes[opname])
    })
  }

  const program =
    input
      .split(/\n{3,}/)[1]
      .split(/\n/)
      .filter(complement(isEmpty))
      .map(pipe(split(/ /), map(Number)))

  return reduce(
    (register, [opcode, ...parameters]) => invoke(register, parameters, opByCode[opcode]),
    [0, 0, 0, 0],
    program)[0]
}

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
  console.log('Part 1:', part1(input))
  console.log('Part 2:', part2(input))
}
