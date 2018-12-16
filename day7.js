const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either } = require('ramda') // eslint-disable-line no-unused-vars

const input = require('fs').readFileSync(process.argv[2], { encoding: 'utf8' })

const lineIsNotEmpty = line => line.length !== 0
const lines = input.split('\n').filter(lineIsNotEmpty)

const originalRules = lines.map(line => /^Step (.) must be finished before step (.)/.exec(line).slice(1))

let originalLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
originalLetter = originalLetter.filter(l => originalRules.some(r => r[0] === l || r[1] === l))

let letters = originalLetter
let rules = originalRules

const isStartable = currentRules => letter => !currentRules.some(([, first]) => first === letter)
while (!isEmpty(letters)) {
  const nextLetter = letters.find(isStartable(rules))
  letters = letters.filter(complement(equals(nextLetter)))
  rules = rules.filter(complement(propEq(0, nextLetter)))

  process.stdout.write(nextLetter)
}
console.log()

const fixAmount = 60
const workerAmount = 5

const durations = {}
originalLetter.forEach(letter => {
  durations[letter] = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1 + fixAmount
})

letters = originalLetter
rules = originalRules

let time = 0
const workers = Array(workerAmount).fill({ busyUntil: -Infinity })
let busy = 0

while (!isEmpty(letters) || busy > 0) {
  workers.forEach((worker, index) => {
    const nextLetter = letters.find(isStartable(rules))
    if (nextLetter != null && worker.busyUntil <= time) {
      workers[index] = { letter: nextLetter, busyUntil: time + durations[nextLetter] }
      letters = letters.filter(complement(equals(nextLetter)))
      busy++
    }
  })
  time++
  workers.forEach((worker) => {
    if (worker.busyUntil === time) {
      rules = rules.filter(complement(propEq(0, worker.letter)))
      busy--
    }
  })
}
console.log(time)
