module.exports = (string) => {
  if (typeof string !== 'string') {
    string = String(string)
  }
  console.log(string)
}
