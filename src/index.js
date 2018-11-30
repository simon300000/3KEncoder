const trimTrailingLines = require('trim-trailing-lines')
/**
Remove final newline characters from `value`.

Parameters
- `value` (`string`) — Value with trailing newlines, coerced to string.

Returns:
`string` — Value without trailing newlines.


Example:
  var trimTrailingLines = require('trim-trailing-lines')

  trimTrailingLines('foo\nbar') // => 'foo\nbar'
  trimTrailingLines('foo\nbar\n') // => 'foo\nbar'
  trimTrailingLines('foo\nbar\n\n') // => 'foo\nbar'
 */

const splitLines = require('split-lines')
/**
splitLines(input, [options])

input
  Type: `string`
    - String to split.

options
  Type: `Object`

preserveNewlines
  Type: `boolean`<br>
  Default: `false`

Preserve the line separator at the end of every line, except the last line, which will never contain one.


Example:
const splitLines = require('split-lines');

splitLines('foo\r\nbar\r\nbaz\nrainbow');
//=> ['foo', 'bar', 'baz', 'rainbow']

splitLines('foo\r\nbar\r\nbaz\nrainbow', {preserveNewlines: true});
//=> ['foo\r\n', 'bar\r\n', 'baz\n', 'rainbow']
 */

const stringOccurrence = require('string-occurrence')
/**
stringOccurrence(input, search, [options])

input
Type: `string` = The string to search in.

search
Type: `string`, `string[]` = The keyword or keywords to search for.

options
  - caseInsensitive
    Type: `boolean`
    Default: `true`

Perform a case insensitive match.

Example:
const stringOccurrence = require('string-occurrence');

stringOccurrence('foo bar', 'foo');
//=> 1

stringOccurrence('foo bar\nfoo baz', 'foo');
//=> 2

stringOccurrence('foo bar\nfoo baz', ['foo', 'baz']);
//=> 3
 */

const isOdd = require('is-odd')
/**
Example:
const isOdd = require('is-odd');

console.log(isOdd('1')); //=> true
console.log(isOdd('3')); //=> true

console.log(isOdd(0)); //=> false
console.log(isOdd(2)); //=> false
*/


/**
 * Parse the array input
 * @method resolve
 * @param  {Array} story The array form of raw story
 * @return {Object}      The object after parsing the array
 */


const resolve = story => {
  let result = {}
  let storyLine = [0]
  let choice = []

  for (let i = 0; i < story.length; i++) {
    let line = story[i]

    // If the line does not start with '>' in markdown.
    if (line[0] !== `>`) {

      // ?
      if (storyLine.length > 1) {

        storyLine = [storyLine[0] + 1]

        if (result[`_${storyLine.join(`_`)}`] === undefined) {
          result[`_${storyLine.join(`_`)}`] =
          [{
            afterChoice: true,
            mark: `_${storyLine.join(`_`)}`
          }]
        }
      }
    }

    let chapterName = `_${storyLine.join(`_`)}`

    // If the return value of arry result is not defined.
    if (result[chapterName] === undefined) {
      result[chapterName] =
      [{
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
            result[chapterName] =
            [{
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

/**
 * This is the entry of the function that parse the markdown file,
 * A raw string parser, parse string to array and pass to analyzer.
 * @method exports
 * @param  {String} string The Markdown file as string
 * @return {Object}        The object after parsing the markdown file
 */
module.exports = string => {
  if (typeof string !== 'string') {
    string = String(string)
    // If the input is something like a blob, make it string
  }
  string = trimTrailingLines(string)
  // Trim blank lines that might be at the end of markdown file
  let input = splitLines(string)
  // Produce a array of each line
  let lines = Math.ceil(input.length / 2)
  // Since we don't need blank lines, the amount of lines is halfed
  let story = []

  for (let i = 0; i < lines; i++) {
    story.push(input[i * 2])
    // produce the array without blank lines
  }
  return resolve(story)
}
