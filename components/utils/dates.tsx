const { DateTime } = require('luxon');

/**
 * returns a date object representing last Monday from the day that is passed in
 * @param {DateTime} day 
 */
function getLastMonday(date?: typeof DateTime): typeof DateTime { // if day isn't passed in, assume its the actual today
  if (!date) {
    var lastMonday = DateTime.local();
  } else {
    var lastMonday = DateTime.fromObject({
      year: date.year,
      month: date.month,
      day: date.day,
    });
  }
   // weekday is 1-7 where 1 is monday, 7 is sunday
  return lastMonday.minus({day: lastMonday.weekday - 1}).set({
    hour: 0, minute: 0,  second: 0, millisecond: 0
  });
}

/**
 * returns a date object representing next Sunday from the day that is passed in
 * @param {DateTime} day 
 */
function getNextSunday(date?: typeof DateTime): typeof DateTime {
  if (!date) {
    var nextSunday = DateTime.local();
  } else {
    var nextSunday = DateTime.fromObject({
      year: date.year,
      month: date.month,
      day: date.day,
    });
  }
  // weekday is 1-7 where 1 is monday, 7 is sunday
  return nextSunday.plus({day: 7 - nextSunday.weekday}).set({
    hour: 0, minute: 0, second: 0, millisecond: 0
  });
}

/**
 * Checks that two date time objects have the same day calendar date
 * @param {DateTime} day1 
 * @param {DateTime} day2 
 */
function sameDate(date1: typeof DateTime , date2: typeof DateTime): typeof DateTime  {
  return date1.day === date2.day &&
        date1.month === date2.month &&
        date1.year === date2.year;
}

function formatDateToDisplay(isoDateString: string) {
  const dateObject = DateTime.fromISO(isoDateString);
  return `${dateObject.weekdayShort}, ${dateObject.month}/${dateObject.day}`
}

export {
  getLastMonday,
  getNextSunday,
  sameDate,
  formatDateToDisplay
}