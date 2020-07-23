import React, {Component} from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { UserDataContext } from "../../Context"
import { parseDate } from "../utils/unitConverter"
import Carousel from './carousel/Carousel'
import Calories from './Calories'
import Duration from './Duration'
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
    const [state, setState] = React.useState({
      activityIndex: 0,
      pastGraphLabels: [],
      pastGraphData: [],
      progressionLabels: [],
      progressionDate: [], 
    })

    React.useEffect(() => {
      makePastGraphLabels()
      makePastGraphData()
    }, [])
    
    const { activityJson, id } = props.route.params

    const roundToNDecimals = (num, decimals) => {
      return parseFloat(num).toFixed(decimals)
    }

    const isNullOrUndefined = (input) => {
      return (input == null)
    }

    // gets the labels for the graph that displays num field over past upload dates
    const makePastGraphLabels = () => {
      var pastGraphLabels = []
      // can be either run, jump or swimming json
      activityJson.activityData.forEach((session, idx) => {
        var { uploadDate } = session
        var stringToDate = new Date(uploadDate)
        // this is an array
        var dateInfo = parseDate(stringToDate)
        pastGraphLabels.push(dateInfo[0] + ", " + dateInfo[1] + " " + dateInfo[2])
      })
      reverse(pastGraphLabels)
      setState({ ...state, pastGraphLabels })
    }

    const makePastGraphData = () => {
      var pastGraphData = []
      activityJson.activityData.forEach((session, idx) => {
        var { num } = session
        pastGraphData.push(num)
      })
      reverse(pastGraphData)
      setState({ ...state, pastGraphData })
    }

    // returns Day of week, month day (num) in a string format
    // i.e Sat, Jul 20
    const displayDate = () => {
      var { activityIndex } = state
      if (activityJson.activityData.length === 0) {
        return "No uploads yet"
      }
      var { uploadDate } = activityJson.activityData[activityIndex]
      var parsed = parseDate(new Date(uploadDate))
      var date = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      return date
    }

    const dropdownItemClick = (activityIndex) => {
      // on dropdown date click, display that date on the dropdown,
      // and switch the image slider to display that date
      setState({ ...state, activityIndex })
    }

    const calcAvgNum = () => {
      // Activity json contains all the queried activity data
      // NOTE THIS IS NOT THE TRUE AVG SINCE THE QUERY IS AT MAX
      // (50) DOCUMENTS OF ACTIVITY DATA
      var { activityData } = activityJson
      var avg = 0
      var count = 0
      activityData.forEach((session, idx) => {
        avg += session.num
        count += 1
      })
      return (count === 0) ? 0 : Math.round(avg / count)
    }

    const calcAvgCals = () => {
      var { activityData } = activityJson
      var avg = 0
      var count = 0
      activityData.forEach((session, idx) => {
        avg += session.calories
        count += 1
      })
      return (count === 0) ? 0 : Math.round(avg / count)
    }

    const previousSlide = () => {
      const { activityData } = activityJson
      const lowestIndex = Math.max(0, activityData.length - 1)
      const nextIndex = Math.min((state.activityIndex + 1), lowestIndex)
      setState({ ...state, activityIndex: nextIndex })
      console.log("previous pressed! ", state.activityIndex)
    }
  
    const nextSlide = () => {
      // 0 represents the most recent upload date
      const nextIndex = Math.max((state.activityIndex - 1), 0)
      setState({ ...state, activityIndex: nextIndex })
      console.log("next pressed! ", state.activityIndex)
    }

    const { activityIndex, pastGraphData, pastGraphLabels } = state
    const currentStatDisplay = activityJson.activityData[activityIndex]
    console.log('fitness page state: ', id, state)
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContents}
        style={styles.container}
      >
        <Carousel
          stats={activityJson}
          previousSlide={previousSlide}
          nextSlide={nextSlide}
          activityIndex={activityIndex}
          displayDate={displayDate}
          dropdownItemClick={dropdownItemClick}
        />
        <View>
          <Calories 
            cals={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.calories}
          />
          <Duration 
            duration={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.time}
          />
        </View>
        <WrappedComponent
          pastGraphData={pastGraphData}
          pastGraphLabels={pastGraphLabels}
          activityIndex={activityIndex}
          dropdownItemClick={dropdownItemClick}
          displayDate={displayDate}
          nextSlide={nextSlide}
          previousSlide={previousSlide}
          calcAvgNum={calcAvgNum}
          calcAvgCals={calcAvgCals}
          isNullOrUndefined={isNullOrUndefined}
          roundToNDecimals={roundToNDecimals}
          {...props.route.params}
        />
      </ScrollView>
    )
  }
  return WithFitnessPage
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  scrollContents: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calsAndTimeContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
})

