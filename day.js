/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone } = require('ramda') // eslint-disable-line no-unused-vars

const test = process.env.NODE_ENV === 'test' ? it : () => {}

// const lineIsNotEmpty = line => line.length !== 0
// const lines = input.split('\n').filter(lineIsNotEmpty)

test('.', () => {
})

// const main = args => {
//   const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })
//   return readFile(args[0])
// }

if (process.env.NODE_ENV !== 'test') {
  // console.log(main(process.argv.slice(2)))
}
