import React, {Component} from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { UserDataContext } from "../../Context"
import { parseDate } from "../utils/unitConverter"

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
      var { activityJson } = props.route.params
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
      var { activityJson } = props.route.params
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
      var { activityJson } = props.route.params
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
      var { activityData } = props.route.params.activityJson
      var avg = 0
      var count = 0
      activityData.forEach((session, idx) => {
        avg += session.num
        count += 1
      })
      return (count === 0) ? 0 : Math.round(avg / count)
    }

    const calcAvgCals = () => {
      var { activityData } = props.route.params.activityJson
      var avg = 0
      var count = 0
      activityData.forEach((session, idx) => {
        avg += session.calories
        count += 1
      })
      return (count === 0) ? 0 : Math.round(avg / count)
    }

    const previousSlide = () => {
      var { activityData } = props.route.params.activityJson
      var nextIndex = Math.min((state.activityIndex + 1), activityData.length - 1)
      setState({ ...state, activityIndex: nextIndex })
    }
  
    const nextSlide = () => {
      // 0 represents the most recent upload date
      var nextIndex = Math.max((state.activityIndex - 1), 0)
      setState({ ...state, activityIndex: nextIndex })
    }

    var { activityIndex, pastGraphData, pastGraphLabels } = state
    return (
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
    )
  }
  return WithFitnessPage
}

