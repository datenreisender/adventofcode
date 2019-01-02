const { identity, split } = require('ramda')

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}

exports.describe = justDuringTest(global.describe)
exports.test = justDuringTest(global.test)
exports.xtest = justDuringTest(global.xtest)

exports.TODO = identity

const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })

const lineIsNotEmpty = line => line.length !== 0
const lines = input => input.split('\n').filter(lineIsNotEmpty)

const dayNum = () => process.argv[1].match(/day(\d*).js$/)[1]
exports.inputContent = () => readFile('input-day' + dayNum())
exports.inputContentLines = (text = exports.inputContent()) => lines(text)
exports.inputContentChars = (text = exports.inputContent()) => lines(text).map(split(''))
