const { values, toPairs, splitEvery, range, reduce, maxBy, minBy, prop, equals, sum, isEmpty, complement, propEq, either, times, propOr, __, pathOr } = require('ramda') // eslint-disable-line no-unused-vars

const input = require('fs').readFileSync(process.argv[2], { encoding: 'utf8' })

const lineIsNotEmpty = line => line.length !== 0
const lines = input.split('\n').filter(lineIsNotEmpty)

const numbers = lines[0].split(' ').map(Number)

const childrenSum = (children, meta) =>
  sum(meta.map(m => pathOr(0, [m - 1, 'value'], children)))

const parseNextNode = (text, metaSum) => {
  let [childrenNum, metaNum, ...rest] = text
  const children = []
  times(() => {
    let child
    [rest, child, metaSum] = parseNextNode(rest, metaSum)
    children.push(child)
  }, childrenNum)

  const meta = rest.splice(0, metaNum)
  metaSum += sum(meta)
  const value = childrenNum === 0 ? sum(meta) : childrenSum(children, meta)

  const node = {
    header: {
      children: childrenNum,
      meta: metaNum
    },
    meta,
    children,
    value
  }

  return [rest, node, metaSum]
}

const [, { value }, metaSum] = parseNextNode(numbers, 0)

console.log(metaSum, value)
