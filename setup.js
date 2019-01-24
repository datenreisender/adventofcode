const { identity, split } = require('ramda')

const justDuringTest = valueWhenRunningAsTest =>
  process.env.NODE_ENV === 'test' ? valueWhenRunningAsTest : () => {}

exports.describe = justDuringTest(global.describe)
exports.test = justDuringTest(global.test)
exports.xtest = justDuringTest(global.xtest)

exports.TODO = identity

const readFile = name => require('fs').readFileSync(name, { encoding: 'utf8' })

const lineIsNotEmpty = line => line.length !== 0
exports.lines = input => input.split('\n').filter(lineIsNotEmpty)
exports.chars = input => exports.lines(input).map(split(''))

const baseFilename = () => process.argv[1].match(/(day\d+).js$/)[1]
exports.inputContent = () => readFile(baseFilename() + '-input')
exports.inputContentLines = (text = exports.inputContent()) => exports.lines(text)
exports.inputContentChars = (text = exports.inputContent()) => exports.chars(text)
