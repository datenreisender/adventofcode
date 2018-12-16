const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr, insert, repeat, zip, flatten, remove, over, add, lensIndex, scan } = require('ramda') // eslint-disable-line no-unused-vars

// const input = require('fs').readFileSync(process.argv[2], { encoding: 'utf8' });
// const lineIsNotEmpty = line => line.length !== 0;
// const lines = input.split("\n").filter(lineIsNotEmpty);

const moves = (playerCount, lastMarble) => {
  const marbles = range(1, lastMarble + 1)
  const players = range(0, playerCount)

  return zip(marbles, flatten(repeat(players, Math.floor(lastMarble / playerCount + 1))))
}

const nextMarblePos = (marblePos, fieldLength) =>
  marblePos + 1 === fieldLength ? 1 : marblePos + 2
const nextField = (marblePos, field, marbleValue) =>
  insert(nextMarblePos(marblePos, field.length), marbleValue, field)

const nextMarblePosInValuationRound = (marblePos, fieldLength) =>
  marblePos - 7 + (marblePos - 7 < 0 ? fieldLength : 0)

const nextFieldInValuationRound = (marblePos, field) =>
  remove(nextMarblePosInValuationRound(marblePos, field.length), 1, field)

const initialState = playerCount => ({
  field: [0],
  marblePos: 0,
  playerValuations: Array(playerCount).fill(0)
})

const nextState = ({ field, marblePos, playerValuations }, [marbleValue, player]) => {
  return marbleValue % 23 === 0
    ? {
      field: nextFieldInValuationRound(marblePos, field),
      marblePos: nextMarblePosInValuationRound(marblePos, field.length) === field.length - 1 ? 0 : nextMarblePosInValuationRound(marblePos, field.length),
      playerValuations: over(lensIndex(player), add(marbleValue + field[nextMarblePosInValuationRound(marblePos, field.length)]), playerValuations)
    }
    : {
      playerValuations,
      field: nextField(marblePos, field, marbleValue),
      marblePos: nextMarblePos(marblePos, field.length)
    }
}

if (process.env.T !== 't') {
  const playerCount = Number(process.argv[2])
  const lastMarble = Number(process.argv[3])

  const result = moves(playerCount, lastMarble).reduce(nextState, initialState(playerCount))
  console.log(Math.max(...result.playerValuations))

  // console.log(scan(nextState, initialState, moves))
} else {
  const check = (startPos, endPos, endField, nextMarble = 229, playerValuations = [0, 0]) => {
    const initial = {
      field: range(0, 10),
      marblePos: startPos,
      playerValuations: [0, 0]
    }

    const result = nextState(initial, [nextMarble, 0])

    const expected = {
      field: endField,
      marblePos: endPos,
      playerValuations }

    if (!equals(result, expected)) { console.error('startPos:\n', startPos, '\nExpected:\n', expected.marblePos, '\nActual:\n', result.marblePos, '\n') }
  }

  check(0, 2, [0, 1, 229, 2, 3, 4, 5, 6, 7, 8, 9])
  check(1, 3, [0, 1, 2, 229, 3, 4, 5, 6, 7, 8, 9])
  check(2, 4, [0, 1, 2, 3, 229, 4, 5, 6, 7, 8, 9])
  check(3, 5, [0, 1, 2, 3, 4, 229, 5, 6, 7, 8, 9])
  check(4, 6, [0, 1, 2, 3, 4, 5, 229, 6, 7, 8, 9])
  check(5, 7, [0, 1, 2, 3, 4, 5, 6, 229, 7, 8, 9])
  check(6, 8, [0, 1, 2, 3, 4, 5, 6, 7, 229, 8, 9])
  check(7, 9, [0, 1, 2, 3, 4, 5, 6, 7, 8, 229, 9])
  check(8, 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 229])
  check(9, 1, [0, 229, 1, 2, 3, 4, 5, 6, 7, 8, 9])

  check(7, 0, [1, 2, 3, 4, 5, 6, 7, 8, 9], 230, [230, 0])
  check(8, 1, [0, 2, 3, 4, 5, 6, 7, 8, 9], 230, [231, 0])
  check(9, 2, [0, 1, 3, 4, 5, 6, 7, 8, 9], 230, [232, 0])
  check(0, 3, [0, 1, 2, 4, 5, 6, 7, 8, 9], 230, [233, 0])
  check(1, 4, [0, 1, 2, 3, 5, 6, 7, 8, 9], 230, [234, 0])
  check(2, 5, [0, 1, 2, 3, 4, 6, 7, 8, 9], 230, [235, 0])
  check(3, 6, [0, 1, 2, 3, 4, 5, 7, 8, 9], 230, [236, 0])
  check(4, 7, [0, 1, 2, 3, 4, 5, 6, 8, 9], 230, [237, 0])
  check(5, 8, [0, 1, 2, 3, 4, 5, 6, 7, 9], 230, [238, 0])
  check(6, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8], 230, [239, 0])

  const acceptance = (playerCount, lastMarble, expected) => {
    const actual = Math.max(...moves(playerCount, lastMarble).reduce(nextState, initialState(playerCount)).playerValuations)
    if (actual !== expected) {
      console.error(`${playerCount} players, last marble ${lastMarble}: Expected was ${expected}, but was ${actual}`)
    }
  }

  acceptance(9, 25, 32)
  acceptance(10, 1618, 8317)
  acceptance(13, 7999, 146373)
  acceptance(17, 1104, 2764)
  acceptance(21, 6111, 54718)
  acceptance(30, 5807, 37305)
  acceptance(419, 72164, 423717)
}
