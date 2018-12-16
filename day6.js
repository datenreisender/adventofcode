const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum } = require('ramda') // eslint-disable-line no-unused-vars

const input = require('fs').readFileSync(process.argv[2], { encoding: 'utf8' })

const lineIsNotEmpty = line => line.length !== 0
const lines = input.split('\n').filter(lineIsNotEmpty)

const points = lines.map(line => line.split(', ').map(Number))

// Minimale und Maximale Ausdehnung in X und Y bestimmen
const minX = reduce(minBy(prop(0)), [Infinity, NaN], points)[0]
const maxX = reduce(maxBy(prop(0)), [-Infinity, NaN], points)[0]
const minY = reduce(minBy(prop(1)), [NaN, Infinity], points)[1]
const maxY = reduce(maxBy(prop(1)), [NaN, -Infinity], points)[1]

const xRange = range(minX, maxX + 1)
const yRange = range(minY, maxY + 1)

// Entsprechendes Spielfeld mit maximalen Ausdehnungen anlegen
const field = []
xRange.forEach(i => { field[i] = [] })

// Über alle X und Y iterieen mit jedem Punkt die Distanz vergleichen und entsprechend markieren
const computeDistances = (x, y) => points.map(point => Math.abs(point[0] - x) + Math.abs(point[1] - y))

const closestPoint = (x, y) => {
  const distances = computeDistances(x, y)
  const min = Math.min(...distances)
  return distances.indexOf(min) === distances.lastIndexOf(min) ? distances.indexOf(min) : undefined
}
xRange.forEach(x =>
  yRange.forEach(y => {
    field[x][y] = closestPoint(x, y)
  }))

// Die Ränder abgehen: Alle dortigen Punkte sind unendlich
const raender = [field[minX], field[maxX], xRange.map(x => [field[x][minY], field[x][maxY]])].flat(2)
const infinities = new Set(raender)

// Das Spielfeld durchgehen, unendliche Punkte ignorieren und zaehlen, wie groß die anderen Felder sind
const counter = Array(points.length).fill(0)
xRange.forEach(x =>
  yRange.forEach(y => {
    const value = field[x][y]
    if (!infinities.has(value)) {
      counter[value]++
    }
  }
  ))

const maxCounter = Math.max(...counter)

console.log(maxCounter, counter.findIndex(equals(maxCounter)))

const totalDistance = (x, y) => sum(computeDistances(x, y))
const safeThreshold = 10000
xRange.forEach(x => {
  if (totalDistance(x, minY) < safeThreshold) console.error(x, minY)
  if (totalDistance(x, maxY) < safeThreshold) console.error(x, maxY)
})
yRange.forEach(y => {
  if (totalDistance(minX, y) < safeThreshold) console.error(minX, y)
  if (totalDistance(maxX, y) < safeThreshold) console.error(maxX, y)
})

let safeFields = 0
xRange.forEach(x =>
  yRange.forEach(y => {
    if (totalDistance(x, y) < safeThreshold) safeFields++
  }
  ))
console.log(safeFields)
