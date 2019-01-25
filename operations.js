/* eslint-env jest */
const { add, curry, update, multiply } = require('ramda')
const { test } = require('./setup')

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

exports.operations = { addr, addi, mulr, muli, banr, bani, borr, bori, setr, seti, gtir, gtri, gtrr, eqir, eqri, eqrr }
exports.invoke = curry((registers, [input1, input2, output], op) => update(output, op(registers, [input1, input2]), registers))

test('some invocations', () => {
  expect(exports.invoke([3, 2, 1, 1], [2, 1, 2], mulr)).toEqual([3, 2, 2, 1])
  expect(exports.invoke([3, 2, 1, 1], [2, 1, 2], addi)).toEqual([3, 2, 2, 1])
  expect(exports.invoke([3, 2, 1, 1], [2, 1, 2], seti)).toEqual([3, 2, 2, 1])
})
