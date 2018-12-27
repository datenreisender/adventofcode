/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach } = require('ramda') // eslint-disable-line no-unused-vars

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}
const describe = justDuringTest(global.describe) // eslint-disable-line no-unused-vars
const test = justDuringTest(global.test) // eslint-disable-line no-unused-vars
const xtest = justDuringTest(global.xtest) // eslint-disable-line no-unused-vars

const TODO = identity

const toRecipe = TODO
const length = TODO
const nextRecipe = TODO
const toString = TODO

const part1 = (input, fewRecipiesNo) => {
  const requiredRecipiesNo = fewRecipiesNo + 10
  let recipe = toRecipe(input)
  let positions = [recipe.start, recipe.next]
  while (length(recipe) < requiredRecipiesNo) {
    nextRecipe(recipe, positions)
  }

  return toString(recipe)
}

xtest('acceptance of part 1', () => {
  expect(part1('37', 9)).toBe('5158916779')
  expect(part1('37', 5)).toBe('0124515891')
  expect(part1('37', 18)).toBe('0124515891')
  expect(part1('37', 2018)).toBe('5941429882')
})

if (process.env.NODE_ENV !== 'test') {
  const inputOfPart1 = '580741'
  console.log(part1(inputOfPart1, inputOfPart1.length))
}
