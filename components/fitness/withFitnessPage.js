import React from 'react'
import { Divider, Button } from 'react-native-elements'
import { View, StyleSheet, ScrollView } from 'react-native'
import { UserDataContext } from "../../Context"
import { parseDate } from "../utils/dates"
import Carousel from './carousel/Carousel'
import Calories from './Calories'
import Duration from './Duration'

import FITNESS_CONTANTS from '../fitness/FitnessConstants'
// HOC for run, swim, jump fitness pages.
// reuses label and data getting for:
// 1. past laps/jumps/steps (num)
// 2. Carousel display
// 3. Cals and duration circles
// 4. details link button
// 5. pace/jump/time (swim) progressions (swim still adds laps of each stroke done)
// 6. average jumps/steps/laps (num)
// 7. percentToGoal ? 

function reverse(array) {
  var i = 0,
      n = array.length,
      middle = Math.floor(n / 2),
      temp = null;

  for (; i < middle; i += 1) {
     temp = array[i];
     array[i] = array[n - 1 - i];
     array[n - 1 - i] = temp;
  }
}

export default function withFitnessPage( WrappedComponent ) {  
  const WithFitnessPage = (props) => {
    const context = React.useContext(UserDataContext);
    const [weekIndex, setWeekIndex] = React.useState(0);
    const [dayIndex, setDayIndex] = React.useState(0);

    const [weeklyGraphLabels, setWeeklyGraphLabels] = React.useState([]);
    const [weeklyGraphData, setWeeklyGraphData] = React.useState([]);
    const { activityJson, id } = props.route.params;
    React.useEffect(() => {
      makeWeeklyGraphLabels();
      makeWeeklyGraphData();
    }, [weekIndex]);
    

    const roundToNDecimals = (num, decimals) => {
      return parseFloat(num).toFixed(decimals);
    }

    const isNullOrUndefined = (input) => {
      return (input == null);
    }

    // gets the labels for the graph that displays num field over past upload dates
    const makeWeeklyGraphLabels = () => {
      const weeklyGraphLabels = [];
      const week = activityJson.activityData[weekIndex];
      week.forEach((session, idx) => {
        const { uploadDate } = session;
        const dateInfo = parseDate(uploadDate);
        const month = new Date(uploadDate).getMonth() + 1;
        weeklyGraphLabels.push(`${dateInfo[0]}, ${month}/${dateInfo[2]}`);
      });
      console.log('weekly graph labels: ', weeklyGraphLabels);
      setWeeklyGraphLabels(weeklyGraphLabels);
    }

    // Once the user selects a date, then get the week containing that day for this graph
    const makeWeeklyGraphData = () => {
      const weeklyGraphData = [];
      const week = activityJson.activityData[weekIndex];
      // for Jump data, people probably only really care about how high they jumped
      if (activityJson.action === FITNESS_CONTANTS.JUMP) {
        week.forEach((session, idx) => {
          const { heights } = session;
          weeklyGraphData.push(Math.max(0, ...heights));
        })
      } else {
        week.forEach((session, idx) => {
          const { num } = session;
          weeklyGraphData.push(num);
        })
      }
      console.log('weekly graph data: ', weeklyGraphData);
      setWeeklyGraphData(weeklyGraphData);
    }

    // on dropdown date click, display that week on the dropdown,
    // and switch the image slider to display that week. Also must update the 
    // activityData array for that week 
    const dropdownItemClick = (newWeekIndex) => {
      console.log("new week idx: ", newWeekIndex);
      setWeekIndex(newWeekIndex);
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
      console.log("next pressed! ", nextIndex);
    }
  
    const previousSlide = () => {
      // 0 represents the most recent upload date
      const week = activityJson.activityData[weekIndex];
      const nextIndex = (dayIndex - 1 + week.length) % week.length;
      setDayIndex(nextIndex);
      console.log("previous pressed! ", nextIndex);
    }

    var sessionDay;
    if (activityJson.activityData.length > 0 && activityJson.activityData[weekIndex].length >= dayIndex) {
      sessionDay = activityJson.activityData[weekIndex][dayIndex];
    }
    return (
      <View
        style={styles.container}
      >
        <Carousel
          activityJson={activityJson}
          previousSlide={previousSlide}
          nextSlide={nextSlide}
          weekIndex={weekIndex}
          dayIndex={dayIndex}
          dropdownItemClick={dropdownItemClick}
        />
        <View style={styles.calsAndTimeContainer}>
          <Calories 
            cals={sessionDay ? sessionDay.calories : 0}
            activity={activityJson.action}
          />
          <Duration 
            duration={sessionDay ? sessionDay.time : 0}
            activity={activityJson.action}
          />
        </View>
        <Divider style={{width: '95%'}}/>
        <WrappedComponent
          weeklyGraphData={weeklyGraphData}
          weeklyGraphLabels={weeklyGraphLabels}
          weekIndex={weekIndex}
          dayIndex={dayIndex}
          currentDay={sessionDay}
          calcAvgNum={calcAvgNum}
          calcAvgCals={calcAvgCals}
          roundToNDecimals={roundToNDecimals}
          isNullOrUndefined={isNullOrUndefined}
          {...props.route.params}
        />
      </View>
    )
  }
  return WithFitnessPage
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

