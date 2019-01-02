/* eslint-env jest */

const { toPairs } = require('ramda')
const { inputContentChars } = require('./setup')

module.exports = part1 => {
  const testInputs = { [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######
`]: 27730,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######
`]: 36334,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######
`]: 39514,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######
`]: 27755,
  [ /* eslint-disable-line standard/computed-property-even-spacing */ `
#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######
`]: 28944,
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
`]: 18740
  }

  toPairs(testInputs).forEach(([input, result]) => {
    expect(part1(inputContentChars(input))).toBe(result)
  })
}
