const NUM_TO_WORD = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
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