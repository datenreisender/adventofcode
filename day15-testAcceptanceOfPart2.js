/* eslint-env jest */

const { toPairs } = require('ramda')
const { inputContentChars } = require('./setup')

module.exports = part2 => {
  const testInputs = { [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######
`]: 4988,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######
`]: 31284,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######
`]: 3478,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######
`]: 6474,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########
`]: 1140
  }

  toPairs(testInputs).forEach(([input, result]) => {
    expect(part2(inputContentChars(input))).toBe(result)
  })
}
