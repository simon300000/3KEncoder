const trimTrailingLines = require('trim-trailing-lines')
const splitLines = require('split-lines')
const stringOccurrence = require('string-occurrence')
const isOdd = require('is-odd')

const resolve = (story) => {
  let result = {}
  let storyLine = [0]
  let choice = []
  for (let i = 0; i < story.length; i++) {
    let line = story[i]
    if (line[0] !== `>`) {
      if (storyLine.length > 1) {
        storyLine = [storyLine[0] + 1]
        if (result[`_${storyLine.join(`_`)}`] === undefined) {
          result[`_${storyLine.join(`_`)}`] = [{
            afterChoice: true,
            mark: `_${storyLine.join(`_`)}`
          }]
        }
      }
    }
    let chapterName = `_${storyLine.join(`_`)}`
    if (result[chapterName] === undefined) {
      result[chapterName] = [{
        mark: chapterName
      }]
    }
    if (line[0] !== `>`) {
      result[chapterName].push(analyzeLine(line))
    } else {
      if (isOdd(stringOccurrence(line, `> `))) {
        let choiceName = line.replace(`[if]`, ``)
        while (stringOccurrence(choiceName, `> `)) {
          choiceName = choiceName.replace(`> `, ``)
        }
        while ((stringOccurrence(line, `> `) + 3) / 2 < storyLine.length) {
          storyLine.pop()
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
        if (storyLine[(stringOccurrence(line, `> `) + 3) / 2] !== undefined) {
          storyLine.pop()
          choice.pop()
        }
      } else {
        let occurrence = (stringOccurrence(line, `> `) + 2) / 2
        while (stringOccurrence(line, `> `)) {
          line = line.replace(`> `, ``)
        }
        if (occurrence === storyLine.length) {
          result[chapterName].push(analyzeLine(line))
        } else {
          let endChapter = []
          let j
          for (j = 0; j < occurrence; j++) {
            endChapter.push(storyLine[j])
          }
          endChapter[endChapter.length - 1]++
          storyLine = endChapter
          while (choice.length + 1 > storyLine.length) {
            choice.pop()
          }
          chapterName = `_${storyLine.join(`_`)}`
          if (result[chapterName] === undefined) {
            result[chapterName] = [{
              afterChoice: true,
              mark: chapterName
            }]
          }
          result[chapterName].push(analyzeLine(line))
        }
      }
    }
  }
  for (let chapter in result) {
    let last = result[chapter][result[chapter].length - 1]
    if (last.choice) {
      for (let choice in last.choice) {
        let choiceChaper = result[last.choice[choice]][result[last.choice[choice]].length - 1]
        if (!choiceChaper.go && !choiceChaper.choice && !choiceChaper.end) {
          // last.choice[choice]
          let choiceChaperId = last.choice[choice].split('_')
          choiceChaperId.shift()
          while (!result[`_${choiceChaperId.join(`_`)}`].afterChoice) {
            choiceChaperId[choiceChaperId.length - 1]++
            while (result[`_${choiceChaperId.join(`_`)}`] === undefined) {
              choiceChaperId.pop()
              choiceChaperId[choiceChaperId.length - 1]++
              if (choiceChaperId.length === 1) {
                break
              }
            }
            if (choiceChaperId.length === 1) {
              break
            }
          }
          result[last.choice[choice]].push({
            go: `_${choiceChaperId.join(`_`)}`
          })
        }
      }
    }
    if (!last.go && !last.choice && !last.end) {
      throw new Error(`no where to go at ${result[chapter]}`)
    }
  }
  return result
}

const analyzeLine = line => {
  if (line[0] === `[`) {
    line = line.replace(`[`, ``)
    line = line.split(`]`)
    let obj = {}
    if (line[1] === ``) {
      line[1] = true
    }
    obj[line[0]] = line[1]
    return obj
  } else {
    line = line.split(`:`)
    let obj = {
      speech: line
    }
    return obj
  }
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
  return resolve(story)
}
