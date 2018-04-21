const replaceString = require('replace-string')

module.exports = (string) => {
  if (typeof string !== 'string') {
    string = String(string)
  }
  string = replaceString(string, '\n\n', '\n')
  console.log(string)
}
