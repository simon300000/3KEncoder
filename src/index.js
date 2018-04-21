const trimTrailingLines = require('trim-trailing-lines')
const splitLines = require('split-lines')
const stringOccurrence = require('string-occurrence')
const isOdd = require('is-odd')

const resolve = (story) => {
  let result = {}
  let storyLine = [0]
  let choice = []
  for (let i = 0; i < story.length; i++) {
    let chapterName = `_${storyLine.join(`_`)}`
    if (result[chapterName] === undefined) {
      result[chapterName] = [{
        mark: chapterName
      }]
    }
    let line = story[i]
    if (line[0] !== `>`) {
      if (storyLine.length > 1) {
        storyLine = [storyLine[0] + 1]
      }
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
      if (isOdd(stringOccurrence(line, `> `))) {
        let choiceName = line.replace(`[if]`, ``)
        while (stringOccurrence(choiceName, `> `)) {
          choiceName = choiceName.replace(`> `, ``)
        }
        if (storyLine[(stringOccurrence(line, `> `) + 1) / 2] === undefined) {
          choice.push(chapterName)
          storyLine[(stringOccurrence(line, `> `) + 1) / 2] = 0
          result[chapterName].push({
            choice: {}
          })
        } else {
          storyLine[(stringOccurrence(line, `> `) + 1) / 2]++
        }
        result[choice[storyLine.length - 2]][result[choice[storyLine.length - 2]].length - 1].choice[choiceName] = `_${storyLine.join(`_`)}`
        // if (storyLine[stringOccurrence(line, `> `) + 1] !== undefined) {
        //   storyLine.pop()
        // }
      } else {

      }
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
