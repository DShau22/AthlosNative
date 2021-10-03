import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import { Divider } from 'react-native-elements'
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native'
import WeeklyBarChart from "../charts/WeeklyBarChart"
import withFitnessPage, { FitnessPageProps } from "../withFitnessPage"
import ThemeText from '../../generic/ThemeText'
import { UserDataContext } from "../../../Context"
import { COLOR_THEMES } from '../../ColorThemes'
import LineProgression from "../charts/LineProgression"
import DistributionDonut from '../charts/DistributionDonut'
import FITNESS_CONSTANTS from '../FitnessConstants';
import { createStackNavigator } from '@react-navigation/stack';

// btw restPaceMin and walkPaceMax is walking
// greater that walkPaceMax is running
const walkCadenceMax = 130// 130 steps per minute is a fast walk, which is 2.16 steps/sec, 2.314 (.2sec) / step
// anything above restcadenceMax is resting
const restCadenceMin = 60 // say 60 steps per minute is basically resting. 1 step/sec, 5 (.2sec) / step

interface RunProps extends FitnessPageProps {
  navigation: any,
}

const Run = (props: RunProps) => {
  const {
    makeProgressionData,
    navigation,
    weekIndex,
    dayIndex,
    currentDay,
    weeklyGraphData,
    weeklyGraphLabels,
    calcAvgNum,
    calcAvgCals,

    settings,
    activityJson
  } = props;
  const runJson = activityJson;

  const progressionData = React.useMemo(() => {
    return currentDay ? makeProgressionData(currentDay.cadences) : [];
  }, [makeProgressionData, currentDay]);
  // returns an array of percentages for the distribution of walking, running, and resting.
  // returns an empty array if there is no fitness data
  // on a daily basis
  const makeDonutData = () => {
    var runCount = 0;
    var walkCount = 0;
    var count = 0;
    if (!currentDay) return [];
    currentDay.cadences.forEach((cadence, _) => {
      // if cadence is somehow undefined or NaN or null then skip
      if (cadence === undefined || isNaN(cadence)) {
        console.log("this cadence entry is corrupted somehow...", cadence);
      } else {
        if (cadence > walkCadenceMax) {
          runCount += 1;
        } else if (cadence <= walkCadenceMax && cadence > restCadenceMin) {
          walkCount += 1;
        }
        count += 1;
      }
    });
    if (count === 0) return [];
    const runPercent = Math.floor(100 * runCount / count);
    const walkPercent = Math.floor(100 * walkCount / count);
    return [runPercent, walkPercent, 100 - (runPercent + walkPercent)];
  }

  // returns an array of time labels for a given cadences array
  // and the total time the user spent on running mode. Only displays
  // the label for every 5 minutes
  const makeCadenceLabels = (timeseries: Array<any>, showFullData: boolean = false) => {
    let labels = [];
    let { cadences } = currentDay;
    if (timeseries.length === cadences.length || showFullData) {
      // cadences are in 30 second intervals and chart is displaying 100% granular data
      for (let i = 0; i < cadences.length + 1; i+=10) {
        labels.push(`${i/2} min`);
      }
    } else {
      // the actual time series being displayed has crunched data by a factor of cadences.length / timeSeries.length
      let shrinkFactor = Math.ceil(cadences.length / timeseries.length);
      for (let i = 0; i < timeseries.length + 1; i += 10) {
        labels.push(`${(i/2) * shrinkFactor} min`);
      }
    }
    return labels;
  }

  const mainScreen = () =>
  <View style={styles.container}>
    <View style={{alignItems: 'center', marginBottom: 25}}>
      <ThemeText h4>Cadence Progression</ThemeText>
      { currentDay?.cadences.length > FITNESS_CONSTANTS.MAX_PROGRESSION_DATA ? <ThemeText style={{textAlign: 'center', margin: 10}}>(tap chart for finer data)</ThemeText> : null }
    </View>
    <TouchableOpacity
      style={{marginLeft: progressionData.length === 0 ? -15 : 0}}
      disabled={currentDay.cadences.length === progressionData.length}
      onPress={() => {
        navigation.navigate(FITNESS_CONSTANTS.RUN_FINE_DATA_SCREEN, {
          progressionData: [0, ...currentDay.cadences],
          progressionLabels: makeCadenceLabels(currentDay.cadences, true)
        });
      }}
    >
      <LineProgression
        fixedWidth
        activityColor={COLOR_THEMES.RUN_THEME}
        yAxisInterval={5}
        data={progressionData}
        labels={currentDay ? makeCadenceLabels(progressionData) : []}
      />
    </TouchableOpacity>
    <View style={{alignItems: 'center'}}>
      <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
      <ThemeText h4>Activity Distribution</ThemeText>
    </View>
    <View>
      <DistributionDonut
        activity='run'
        style={{height: 250}}
        data={makeDonutData()}
        indexToLabel={['Running', 'Walking', 'Resting']}
        labelUnit='%'
        gradients={COLOR_THEMES.RUN_DONUT_GRADIENTS}
      />
    </View>
    <View style={{alignItems: 'center'}}>
      <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
    </View>
    <View style={{alignItems: 'center'}}>
      <ThemeText h4>Weekly Runs</ThemeText>
    </View>
    <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
      <WeeklyBarChart
        labels={weeklyGraphLabels}
        data={weeklyGraphData}
        activity="Runs"
      />
    </ScrollView>
  </View>

  // const fineDataScreen = () =>
  // <View style={styles.container}>
  //   <View style={{alignItems: 'center', marginBottom: 25}}>
  //     <ThemeText h4>Cadence Progression</ThemeText>
  //       <ScrollView
  //         horizontal
  //         style={{marginTop: 20}}
  //         contentContainerStyle={[styles.sideScrollContent, {marginLeft: runJson.activityData.length === 0 ? -20 : 0}]}
  //       >
  //       <LineProgression
  //         activityColor={COLOR_THEMES.RUN_THEME}
  //         yAxisInterval={5}
  //         data={currentDay ? [0, ...currentDay.cadences] : []}
  //         labels={currentDay ? makeCadenceLabels() : []}
  //       />
  //     </ScrollView>
  //   </View>
  // </View>
  return (
    <View style={styles.container}>
      {mainScreen()}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height: '100%',
    width: '100%',
    // backgroundColor: 'red',
    // alignItems: 'center',
    marginTop: 25
  },
  calsAndTimeContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  circle: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
    // minWidth: 80,
    // alignItems: 'center',
    marginBottom: 10
  },
  cardContainer: {
    width: '90%',
    // height: 80,
    borderRadius: 15,
    marginTop: 20,
  },
  cardContent: {
    flexDirection: 'row',
    marginTop: 5,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  sideScrollContent: {
    alignItems:'center',
  }
})
export default gestureHandlerRootHOC(withFitnessPage(Run))
