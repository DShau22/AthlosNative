import React from 'react';
import { Divider, Button } from 'react-native-elements';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
const { DateTime } = require('luxon');
import Carousel from './carousel/Carousel';
import Calories from './Calories';
import Duration from './Duration';

import FITNESS_CONTANTS from './FitnessConstants';
import { SettingsType } from '../generic/UserTypes';
import { ActivityJson } from './FitnessTypes';
import { JumpSchema, RunSchema, SwimSchema, UserActivities } from './data/UserActivities';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../generic/ThemeText';
import GLOBAL_CONSTANTS from '../GlobalConstants';
import { inchesToCm, roundToDecimal } from '../utils/unitConverter';
import { getLastSunday } from '../utils/dates';

interface fitnessPageHOCProps {
  refreshing?: boolean,
  onRefresh?: Function,
  navigation?: any,

  settings: SettingsType,
  activityJson: ActivityJson,
  dayIndex?: number,
  setDayIndex?: Function,
  weekIndex?: number,
  setWeekIndex?: Function,
}

export default function withFitnessPage( WrappedComponent: any ) {  
  const WithFitnessPage = (props: fitnessPageHOCProps) => {
    const [weeklyGraphLabels, setWeeklyGraphLabels] = React.useState<Array<string>>([]);
    const [weeklyGraphData, setWeeklyGraphData] = React.useState<Array<number>>([]);
    const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
    const { activityJson, settings } = props;
    const { unitSystem } = settings;
    let { dayIndex, weekIndex, setDayIndex, setWeekIndex } = props;
    if (!weekIndex && !setWeekIndex) {
      [weekIndex, setWeekIndex] = React.useState(0);
    }
    if (!dayIndex && !setDayIndex) {
      [dayIndex, setDayIndex] = React.useState(DateTime.local().weekday % 7); // 1 is monday 7 is sunday for .weekday
    }
    const [isLoading, setIsLoading] = React.useState(activityJson.activityData.length === 0);
    const { colors } = useTheme();
    React.useEffect(() => {
      if (activityJson.activityData.length > 0) {
        makeWeeklyGraphLabels();
        makeWeeklyGraphData();
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    }, [weekIndex]);

    const roundToNDecimals = (num, decimals) => {
      return parseFloat(num).toFixed(decimals);
    }

    const isNullOrUndefined = (input) => {
      return (input == null);
    }

    // gets the labels for the graph that displays num field over past upload dates
    const makeWeeklyGraphLabels = () => {
      const weeklyGraphLabels: Array<string> = [];
      const week = activityJson.activityData[weekIndex];
      week.forEach((session, idx) => {
        const { uploadDate } = session;
        const dateObject = DateTime.fromISO(uploadDate);
        weeklyGraphLabels.push(`${dateObject.weekdayShort}`);
      });
      setWeeklyGraphLabels(weeklyGraphLabels);
    }

    // Once the user selects a date, then get the week containing that day for this graph
    const makeWeeklyGraphData = () => {
      const weeklyGraphData: any[] = [];
      const week = activityJson.activityData[weekIndex];
      // for Jump data, people probably only really care about how high they jumped
      if (activityJson.action === FITNESS_CONTANTS.JUMP) {
        week.forEach((session, idx) => {
          const { heights } = session;
          var maxHeight = Math.max(0, ...heights);
          maxHeight = unitSystem === GLOBAL_CONSTANTS.METRIC ? roundToDecimal(inchesToCm(maxHeight), 1) : maxHeight;
          weeklyGraphData.push(maxHeight);
        })
      } else {
        week.forEach((session, idx) => {
          const { num } = session;
          weeklyGraphData.push(num);
        })
      }
      setWeeklyGraphData(weeklyGraphData);
    }

    // on dropdown date click, display that week on the dropdown,
    // and switch the image slider to display that week. Also must update the 
    // activityData array for that week 
    // CHANGE THIS THEN CHANGE IT IN CREATE MENU ITEMS IN CAROUSEL TOO
    const pullUpMenuSelect = (newWeekText) => {
      var indexOf = 0;
      for (let i = 0; i < activityJson.activityData.length - 1; i++) {
        const week = activityJson.activityData[i];
        const monday = DateTime.fromISO(week[0].uploadDate);
        const sunday = DateTime.fromISO(week[week.length - 1].uploadDate);
        const dayMonth = `${monday.monthShort} ${monday.day} - ${sunday.monthShort} ${sunday.day}, ${sunday.year}`
        if (newWeekText === dayMonth) {
          break;
        } else {
          indexOf++;
        }
      }
      setWeekIndex(indexOf);
      setDayIndex(0);
    }

    const calcAvgNum = () => {
      // Activity json contains all the queried activity data
      // NOTE THIS IS NOT THE TRUE AVG SINCE THE QUERY IS AT MAX
      // (50) DOCUMENTS OF ACTIVITY DATA
      var { activityData } = activityJson;
      var avg = 0;
      var count = 0;
      activityData.forEach((week, _) => {
        week.forEach((session, _) => {
          avg += session.num;
          count += 1;
        });
      });
      return (count === 0) ? 0 : Math.round(avg / count);
    }

    const calcAvgCals = () => {
      var { activityData } = activityJson;
      var avg = 0;
      var count = 0;
      activityData.forEach((week, _) => {
        week.forEach((session, _) => {
          avg += session.calories;
          count += 1;
        });
      });
      return (count === 0) ? 0 : Math.round(avg / count);
    }

    const nextSlide = () => {
      const week = activityJson.activityData[weekIndex];
      const nextIndex = (dayIndex + 1) % week.length;
      setDayIndex(nextIndex);
    }
  
    const previousSlide = () => {
      // 0 represents the most recent upload date
      const week = activityJson.activityData[weekIndex];
      const nextIndex = (dayIndex - 1 + week.length) % week.length;
      setDayIndex(nextIndex);
    }

    var sessionDay: any;
    if (activityJson.activityData.length > 0 && activityJson.activityData[weekIndex].length >= dayIndex) {
      sessionDay = activityJson.activityData[weekIndex][dayIndex];
    }
    // for calendar
    const getCurrDate = (): string => {
      if (sessionDay) {
        let dateString = DateTime.fromISO(sessionDay.uploadDate)
        let monthString = dateString.month < 10 ? `0${dateString.month}` : `${dateString.month}`;
        let dayString = dateString.day < 10 ? `0${dateString.day}` : `${dateString.day}`;
        return `${dateString.year}-${monthString}-${dayString}`;
      } else {
        return Date();
      }
    }
    // for calendar
    const getMarkedDates = () => {
      let currDay: string = getCurrDate();
      let res: Object = {};
      res[currDay] = {selected: true};
      return res;
    }
    // for calendar
    const getMaxSelectableDate = () => {
      const today = DateTime.local();
      let monthString = today.month < 10 ? `0${today.month}` : `${today.month}`;
      let dayString = today.day < 10 ? `0${today.day}` : `${today.day}`;
      return `${today.year}-${monthString}-${dayString}`;
    }
    // for calendar
    const getMinSelectableDate = () => {
      var lastSunday = getLastSunday();
      var dateToStartFrom = lastSunday.minus({days: (UserActivities.WEEKS_BACK - 1) * 7});
      let monthString = dateToStartFrom.month < 10 ? `0${dateToStartFrom.month}` : `${dateToStartFrom.month}`;
      let dayString = dateToStartFrom.day < 10 ? `0${dateToStartFrom.day}` : `${dateToStartFrom.day}`;
      return `${dateToStartFrom.year}-${monthString}-${dayString}`;
    }

    const onChangeCalendarDay = (day: number, month: number, year: number) => {
      if (!sessionDay) {
        return;
      }
      console.log(day, month, year);
      const today = DateTime.local();
      const currDay = DateTime.fromISO(sessionDay.uploadDate, {zone: today.zone}).set({
        hour: 0, minute: 0, second: 0, millisecond: 0
      });
      const selectedDay = DateTime.fromObject({day, month, year}, {zone: today.zone});
      let diffInDays = currDay.diff(selectedDay, ['days']).toObject().days;
      let absDiffInDays = Math.abs(diffInDays);
      let dayOffset = absDiffInDays % 7;
      console.log("day index: ", dayIndex);
      if (diffInDays < 0) {
        // we must be forwards in time
        let weekOffset = Math.floor(absDiffInDays / 7) + Math.floor((dayIndex + dayOffset) / 7);
        console.log(diffInDays, absDiffInDays, dayOffset, weekOffset, dayIndex);
        setWeekIndex(weekIndex - weekOffset);
        setDayIndex((dayIndex + dayOffset) % 7);
      } else if (diffInDays > 0) {
        // we must go backwards in time
        let weekOffset = Math.floor(absDiffInDays / 7) + ((dayIndex - dayOffset) < 0 ? 1 : 0);
        console.log(diffInDays, absDiffInDays, dayOffset, weekOffset, (dayIndex - dayOffset + 7) % 7);
        setWeekIndex(weekIndex + weekOffset);
        setDayIndex((dayIndex - dayOffset + 7) % 7);
        console.log(activityJson.activityData[weekIndex + weekOffset]);
      }
    }

    // have a max of 30 data points in the chart
    const makeProgressionData = React.useCallback((timeseries: Array<number>): Array<number> => {
      let res: Array<number> = [];
      if (timeseries.length >= FITNESS_CONTANTS.MAX_PROGRESSION_DATA) {
        // condense every n s.t the new time series is at most 30 points
        let condenseFactor = Math.floor(timeseries.length / 30) + 1;
        let runningSum = 0;
        timeseries.forEach((data, idx) => {
          runningSum += data;
          if ((idx + 1) % condenseFactor === 0) {
            res.push(runningSum / condenseFactor);
            runningSum = 0;
          }
        });
        // isn't completely evenly divisible by 30, then we missed some data that's in the runningSum
        if (timeseries.length % condenseFactor !== 0) {
          res.push(runningSum / (timeseries.length % condenseFactor));
        }        
      } else {
        return timeseries;
      }
      return res;
    }, []);

    // console.log("session Day: ", sessionDay);
    if (isLoading) {
      return <View></View>
    }
    return (
      <View
        style={styles.container}
      >
        <TouchableOpacity
          style={{
            alignItems: "center",
            width: '90%',
            borderRadius: 10,
            backgroundColor: colors.backgroundOffset,
            padding: 10,
            marginTop: 20,
          }}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <ThemeText>{`${showCalendar ? 'Escape' : 'Show'} Calendar View`}</ThemeText>
        </TouchableOpacity>
        {showCalendar ?
          <Calendar
            markedDates={getMarkedDates()}
            maxDate={getMaxSelectableDate()}
            minDate={getMinSelectableDate()}
            current={getCurrDate()}
            style={{
              marginTop: 20,
              width: GLOBAL_CONSTANTS.SCREEN_WIDTH - 20,
              // backgroundColor: 'red'
            }}
            onDayPress={(day) => {
              onChangeCalendarDay(day.day, day.month, day.year);
              setShowCalendar(false);
            }}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.backgroundOffset,
              dayTextColor: '#ffffff',
              todayTextColor: '#ffffff',
              textDisabledColor: '#8c8d8f',
              // dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#ffffff',
              monthTextColor: '#ffffff',
              // indicatorColor: 'blue',
            }}
          />
        :
          <>
            <Carousel
              activityJson={activityJson}
              previousSlide={previousSlide}
              nextSlide={nextSlide}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              pullUpMenuSelect={pullUpMenuSelect}
            />
            <View style={styles.calsAndTimeContainer}>
              <Calories 
                cals={sessionDay ? Math.ceil(sessionDay.calories) : 0}
                activity={activityJson.action}
              />
              <Duration 
                duration={sessionDay ? Math.ceil(sessionDay.time) : 0}
                activity={activityJson.action}
              />
            </View>
            <Divider style={{width: '95%'}}/>
            <WrappedComponent
              makeProgressionData={makeProgressionData}
              weeklyGraphData={weeklyGraphData}
              weeklyGraphLabels={weeklyGraphLabels}
              currentDay={sessionDay}
              calcAvgNum={calcAvgNum}
              calcAvgCals={calcAvgCals}
              roundToNDecimals={roundToNDecimals}
              isNullOrUndefined={isNullOrUndefined}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              {...props}
            />
          </>
        }
      </View>
    )
  }
  return WithFitnessPage
}

export interface FitnessPageProps extends fitnessPageHOCProps {
  weeklyGraphData: Array<number>,
  weeklyGraphLabels: Array<string>,
  weekIndex: number,
  dayIndex: number,
  currentDay: any,
  makeProgressionData: Function,
  calcAvgNum: Function,
  calcAvgCals: Function,
  roundToNDecimals: Function,
  isNullOrUndefined: Function,
  navigation: any,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  scrollContents: {
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  calsAndTimeContainer: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
})

