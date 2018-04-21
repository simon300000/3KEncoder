const trimTrailingLines = require('trim-trailing-lines')
const splitLines = require('split-lines')

module.exports = (string) => {
  if (typeof string !== 'string') {
    string = String(string)
  }
  string = trimTrailingLines(string)
  let input = splitLines(string)
  console.log(input)
}
