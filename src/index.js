const trimTrailingLines = require('trim-trailing-lines')
const splitLines = require('split-lines')

const resolve = (story) => {
  let result = {}
  let storyLine = [0]
  for (let i = 0; i < story.length; i++) {
    let chapterName = `_${storyLine.join(`_`)}`
    if (result[chapterName] === undefined) {
      result[chapterName] = [{
        mark: chapterName
      }]
    }
    let line = story[i]
    if (line[0] !== `>`) {
      if (line[0] === `[`) {
        line = line.replace(`[`, ``)
        line = line.split(`]`)
        let obj = {}
        obj[line[0]] = line[1]
        result[chapterName].push(obj)
      } else {
        line = line.split(`:`)
        result[chapterName].push({
          speech: line
        })
      }
    } else {
      
    }
  }
  return result
}

module.exports = (string) => {
  if (typeof string !== `string`) {
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
