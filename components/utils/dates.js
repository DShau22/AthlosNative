function parseDate(uploadDate) {
  // parses the UTC date object
  var timestampToDate = new Date(uploadDate)
  var dateString = timestampToDate.toString()
  // [Day, Month, month date, year, time, Standard, Standard (written out)]
  var parsed = dateString.split(" ")
  return parsed
}

// returns a date object representing last Monday from today
function getLastMonday() {
  let lastMonday = new Date();
  lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() + 1); // should be the monday of this week
  return lastMonday;
}

// returns a date object representing next Sunday from today
function getNextSunday() {
  let lastMonday = new Date();
  let nextSunday = new Date();
  lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() + 1); // should be the monday of this week
  nextSunday.setDate(lastMonday.getDate() + 6);
  return lastSunday;
}

function sameDate(day1, day2) {
  return day1.getDay() === day2.getDay() && 
        day1.getDate() === day2.getDate() && 
        day1.getMonth() === day2.getMonth() && 
        day1.getFullYear() === day2.getFullYear()
}

export {
  parseDate,
  getLastMonday,
  getNextSunday,
  sameDate
}