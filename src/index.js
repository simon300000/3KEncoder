const trimTrailingLines = require('trim-trailing-lines')


module.exports = (string) => {
  if (typeof string !== 'string') {
    string = String(string)
  }
  string = trimTrailingLines(string)
  console.log(string)
}
