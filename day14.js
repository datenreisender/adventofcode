/* eslint-env jest */
const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone, contains, dropLast, pipe, identity, evolve, subtract, concat, flip, replace, split, join, props, sortBy, forEach } = require('ramda') // eslint-disable-line no-unused-vars

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}
const describe = justDuringTest(global.describe) // eslint-disable-line no-unused-vars
const test = justDuringTest(global.test) // eslint-disable-line no-unused-vars
const xtest = justDuringTest(global.xtest) // eslint-disable-line no-unused-vars

const TODO = identity // eslint-disable-line no-unused-vars

const eachRecipeIsSingleDigit = ({ first }) => {
  let current = first
  do {
    expect(current.value).toBeGreaterThanOrEqual(0)
    expect(current.value).toBeLessThan(10)
    current = current.next
  } while (current !== first)
}

const isValid = recipes => {
  expect(recipes.first).toBeDefined()
  expect(recipes.last).toBeDefined()
  expect(recipes.last.next).toBe(recipes.first)
  eachRecipeIsSingleDigit(recipes)
}

const append = recipes => newValue => {
  recipes.last.next = {
    value: Number(newValue),
    length: recipes.last.length + 1,
    next: recipes.first
  }
  recipes.last = recipes.last.next
}

const toRecipes = input => {
  const [head, ...tail] = input.split('')
  const first = { value: Number(head), length: 1 }
  first.next = first
  const recipes = { first, last: first }
  tail.forEach(append(recipes))

  return recipes
}

const initialPositions = recipes => [recipes.first, recipes.first.next]

const length = ({ last }) => last.length

const newRecipes = positions => {
  const newRecipe = sum(positions.map(prop('value')))
  return newRecipe < 10
    ? [newRecipe]
    : [1, newRecipe - 10]
}

const updatedPosition = position => {
  const toMove = position.value + 1
  times(() => { position = position.next }, toMove)
  return position
}
const updatePositions = positions => positions.forEach((position, index) => { positions[index] = updatedPosition(position) })

const nextRecipes = (recipes, positions) => {
  newRecipes(positions).forEach(append(recipes))
  updatePositions(positions)
}

describe('nextRecipes', () => {
  it('appends a single recipe', () => {
    const recipes = toRecipes('36')
    nextRecipes(recipes, initialPositions(recipes))
    expect(toString(recipes)).toBe('369')
    isValid(recipes)
  })

  it('appends two recipes if the sum is at least 10', () => {
    const recipes = toRecipes('37')
    nextRecipes(recipes, initialPositions(recipes))
    expect(toString(recipes)).toBe('3710')
    isValid(recipes)
  })

  it('moves the elves', () => {
    const recipes = toRecipes('3710')
    const positions = initialPositions(recipes)
    nextRecipes(recipes, positions)
    expect(positions.map(prop('value'))).toEqual([1, 0])
  })
})

const toString = ({ first }) => {
  let current = first
  let result = ''
  do {
    result += current.value
    current = current.next
  }
  while (current !== first)

  return result
}

const part1 = (input, fewRecipesNo) => {
  const requiredRecipesNo = fewRecipesNo + 10
  let recipes = toRecipes(input)
  let positions = initialPositions(recipes)
  while (length(recipes) < requiredRecipesNo) {
    nextRecipes(recipes, positions)
  }

  return toString(recipes).slice(fewRecipesNo, requiredRecipesNo)
}

test('acceptance of part 1', () => {
  expect(part1('37', 9)).toBe('5158916779')
  expect(part1('37', 5)).toBe('0124515891')
  expect(part1('37', 18)).toBe('9251071085')
  expect(part1('37', 2018)).toBe('5941429882')
})

if (process.env.NODE_ENV !== 'test') {
  const inputOfPart1 = 580741
  console.log(part1('37', inputOfPart1))
}
