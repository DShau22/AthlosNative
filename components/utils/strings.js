const NUM_TO_WORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function numToWord(num) {
  return NUM_TO_WORD[num];
}

module.exports = {
  capitalize,
  numToWord
}