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

const isValid = recipies => {
  expect(recipies.first).toBeDefined()
  expect(recipies.last).toBeDefined()
  expect(recipies.last.next).toBe(recipies.first)
  eachRecipeIsSingleDigit(recipies)
}

const append = recipies => newValue => {
  recipies.last.next = {
    value: Number(newValue),
    next: recipies.first
  }
  recipies.last = recipies.last.next
}

const toRecipes = input => {
  const [head, ...tail] = input.split('')
  const first = { value: Number(head) }
  first.next = first
  const recipies = { first, last: first }
  tail.forEach(append(recipies))

  return recipies
}

const initialPositions = recipes => [recipes.first, recipes.first.next]

const length = recipe => toString(recipe).length

const newRecipies = positions => {
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
  newRecipies(positions).forEach(append(recipes))
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

const part1 = (input, fewRecipiesNo) => {
  const requiredRecipiesNo = fewRecipiesNo + 10
  let recipes = toRecipes(input)
  let positions = initialPositions(recipes)
  while (length(recipes) < requiredRecipiesNo) {
    nextRecipes(recipes, positions)
  }

  return toString(recipes).slice(fewRecipiesNo, requiredRecipiesNo)
}

test('acceptance of part 1', () => {
  expect(part1('37', 9)).toBe('5158916779')
  expect(part1('37', 5)).toBe('0124515891')
  expect(part1('37', 18)).toBe('9251071085')
  expect(part1('37', 2018)).toBe('5941429882')
})

if (process.env.NODE_ENV !== 'test') {
  const inputOfPart1 = '580741'
  console.log(part1(inputOfPart1, inputOfPart1.length))
}
