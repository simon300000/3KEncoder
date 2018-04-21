const trimTrailingLines = require('trim-trailing-lines')
const splitLines = require('split-lines')

const resolve = (story) => {
  let result = []
  for (let i = 0; i < story.length; i++) {
    console.log(story[i])
  }
  return result
}

module.exports = (string) => {
  if (typeof string !== 'string') {
    string = String(string)
  }
  string = trimTrailingLines(string)
  let input = splitLines(string)
  let lines = Math.ceil(input.length / 2)
  let story = []
  for (let i = 0; i < lines; i++) {
    story.push(input[i * 2])
  }
  console.log(resolve(story))
}
