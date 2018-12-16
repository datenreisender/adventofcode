const {
  values,
  toPairs,
  splitEvery,
  range
} = require('ramda')

const input = require('fs').readFileSync(process.argv[2], {
  encoding: 'utf8'
})
const lineIsNotEmpty = line => line.length !== 0
// const lines = input.split('\n').filter(lineIsNotEmpty)

const guardLine = /\[\d\d\d\d-\d\d-\d\d \d\d:\d\d] Guard #(\d+) begins shift\n/

const guardsAndTimes = input.split(guardLine).filter(lineIsNotEmpty)
const guards = {}

const minutes = /:(\d\d)/
const minutesFrom = fallsAsleep => Number(minutes.exec(fallsAsleep)[1])

const processTimes = (oldEntry = {
  sleepMinutes: 0,
  sleepTimes: []
}, fallsAsleep, wakesUp) => {
  const startMin = minutesFrom(fallsAsleep)
  const endMin = minutesFrom(wakesUp)

  return {
    sleepMinutes: oldEntry.sleepMinutes + endMin - startMin,
    sleepTimes: [...oldEntry.sleepTimes, [startMin, endMin]]
  }
}
while (guardsAndTimes.length > 0) {
  const id = guardsAndTimes.shift()
  if (!/^\d+$/.exec(guardsAndTimes[0])) {
    const times = splitEvery(2, guardsAndTimes.shift().split('\n').filter(lineIsNotEmpty))
    times.forEach(([fallsAsleep, wakesUp]) => {
      guards[id] = processTimes(guards[id], fallsAsleep, wakesUp)
    })
  }
}

const addSleepTimes = guard => {
  guard.sleepHour = Array(60).fill(0)
  guard.sleepTimes.forEach(([start, end]) =>
    range(start, end).forEach(minute =>
      guard.sleepHour[minute]++
    )
  )
  guard.sleepiestMinuteAmount = Math.max(...guard.sleepHour)
  guard.sleepiestMinute = guard.sleepHour.findIndex(m => m === guard.sleepiestMinuteAmount)
}
values(guards).forEach(addSleepTimes)

const maxSleep = Math.max(...values(guards).map(g => g.sleepMinutes))
const [mostSleepGuardId] = toPairs(guards).find(g => g[1].sleepMinutes === maxSleep)
const sleepHour = guards[mostSleepGuardId].sleepHour
const minute = sleepHour.findIndex(m => m === Math.max(...sleepHour))

console.log('1: ', mostSleepGuardId, minute, mostSleepGuardId * minute)

const maxSleepiestMinuteAmount = Math.max(...values(guards).map(g => g.sleepiestMinuteAmount))
const [mostSleepiestMinuteAmountGuardId, { sleepiestMinute }] = toPairs(guards).find(g => g[1].sleepiestMinuteAmount === maxSleepiestMinuteAmount)
console.log('2: ', mostSleepiestMinuteAmountGuardId, sleepiestMinute, mostSleepiestMinuteAmountGuardId * sleepiestMinute)
// console.log(guards)
