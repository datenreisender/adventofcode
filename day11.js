const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan, clone } = require('ramda') // eslint-disable-line no-unused-vars

const serialNumber = Number(process.argv[2])

const hundredsDigit = num => Math.floor(num / 100) % 10

const powerLevel = (x, y) =>
  hundredsDigit(((x + 10) * y + serialNumber) * (x + 10)) - 5

const dimension = 300
const levels = range(0, dimension).map(x =>
  range(0, dimension).map(y =>
    powerLevel(x + 1, y + 1)
  )
)

const powerLevelSum = (previousSum, x, y, size) =>
  sum([
    previousSum,
    ...range(0, size).map(dx => levels[x + dx][y + size - 1]),
    ...range(0, size - 1).map(dy => levels[x + size - 1][y + dy])
  ])

const initialSums = {
  size: 1,
  sums: range(0, dimension).map(x =>
    range(0, dimension).map(y =>
      ({ x, y, sum: powerLevel(x + 1, y + 1) })
    )
  )
}
const powerLevelSums = scan((previousSums, size) => {
  // console.log(size, Date())

  return {
    size,
    sums: range(0, dimension - size + 1).map(x =>
      range(0, dimension - size + 1).map(y =>
        ({ x, y, sum: powerLevelSum(previousSums.sums[x][y].sum, x, y, size) })
      )
    )
  }
}
, initialSums, range(2, 301))

const maxSum = maxBy(prop('sum'))
const maxSumOfRow = reduce(maxSum, { sum: -Infinity })

const allMaxes = powerLevelSums.map(row => {
  const maxSum = maxSumOfRow(row.sums.map(maxSumOfRow))
  return { sum: maxSum.sum, x: maxSum.x + 1, y: maxSum.y + 1, size: row.size }
})

console.log(maxSumOfRow(allMaxes))
