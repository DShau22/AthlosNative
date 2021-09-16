import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import React, { Component } from 'react'
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { colors, Divider } from 'react-native-elements'
import ThemeText from '../../generic/ThemeText'
import { UserDataContext } from '../../../Context'
import WeeklyBarChart from "../charts/WeeklyBarChart"
import withFitnessPage, { FitnessPageProps } from "../withFitnessPage"
import DistributionDonut from '../charts/DistributionDonut'
import LineProgression from '../charts/LineProgression'
import { COLOR_THEMES } from '../../ColorThemes'
import { useTheme } from '@react-navigation/native';
import FITNESS_CONSTANTS from '../FitnessConstants';
import { SwimStrokesEnum } from '../FitnessTypes';
import { SwimSchema } from '../data/UserActivities';
import { DEVICE_CONFIG_CONSTANTS } from '../../configure/DeviceConfigConstants';

interface SwimProps extends FitnessPageProps {
  navigation: any,
}

const Swim = (props: SwimProps) => {
  const {
    navigation,

    weekIndex,
    dayIndex,
    weeklyGraphData,
    weeklyGraphLabels,
    calcAvgNum,
    calcAvgCals,

    settings,
    activityJson,
    roundToNDecimals,
    isNullOrUndefined
  } = props;
  var currentDay = props.currentDay as SwimSchema;
  const { colors } = useTheme();

  // this is daily
  const makeDonutData = () => {
    const { activityData } = activityJson;
    if (isNullOrUndefined(activityData) || activityData.length === 0) {
      return [];
    }
    var flyCount     = 0, 
        backCount    = 0,
        breastCount  = 0,
        freeCount    = 0,
        otherCount   = 0,
        unknownCount = 0;
    currentDay.strokes.forEach((stroke, _) => {
      if (stroke === SwimStrokesEnum.FLY) {
        flyCount += 1
      } else if (stroke ===  SwimStrokesEnum.BACK) {
        backCount += 1
      } else if (stroke ===  SwimStrokesEnum.BREAST) {
        breastCount += 1
      } else if (stroke ===  SwimStrokesEnum.FREE) {
        freeCount += 1
      } else if (stroke === SwimStrokesEnum.HEAD_UP) {
        // this is head up
        unknownCount += 1;
      } else {
        // some other event?
        otherCount += 1;
      }
    });
    // FIGURE THE POOL LENGTH OUT SOMEHOW
    currentDay.workouts?.forEach((workout) => {
      workout.sets.forEach((set) => {
        if (set.event === DEVICE_CONFIG_CONSTANTS.BUTTERFLY) {
          flyCount += Math.ceil(set.distance / 25);
        } else if (set.event === DEVICE_CONFIG_CONSTANTS.BACKSTROKE) {
          backCount += Math.ceil(set.distance / 25);
        } else if (set.event ===  DEVICE_CONFIG_CONSTANTS.BREASTROKE) {
          breastCount += Math.ceil(set.distance / 25);
        } else if (set.event ===  DEVICE_CONFIG_CONSTANTS.FREESTYLE) {
          freeCount += Math.ceil(set.distance / 25);
        } else if (set.event === DEVICE_CONFIG_CONSTANTS.IM) {
          freeCount += Math.ceil(set.distance / 100);
          breastCount += Math.ceil(set.distance / 100);
          backCount += Math.ceil(set.distance / 100);
          flyCount += Math.ceil(set.distance / 100);
        } else {
          // some other event like kicking
          otherCount += 1;
        }
      })
    });
    if (flyCount + backCount + breastCount + freeCount + unknownCount + otherCount === 0) return [];
    return [flyCount, backCount, breastCount, freeCount, unknownCount, otherCount];
  }

  const makeTimeData = (): Array<number> => {
    if (!currentDay) return [];
    let swimTimes: Array<number> = currentDay.lapTimes.map(({lapTime}, _) => lapTime);
    return swimTimes
  }

  const makeSwimWorkoutTimeData = (): Array<number> => {
    if (!currentDay) return [];
    let res: Array<number> = [];
    currentDay.workouts?.forEach((workout) => {
      workout.sets.forEach(set => {
        res.push(set.timeIntervalInSeconds);
      });
    });
    return res;
  }
  
  const { unitSystem } = settings;
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity
          style={{
            alignItems: "center",
            width: '90%',
            borderRadius: 10,
            backgroundColor: colors.backgroundOffset,
            padding: 10,
          }}
          onPress={() => {navigation.navigate(FITNESS_CONSTANTS.SWIM_DETAILS)}}
        >
          <ThemeText>Swimming Workout Details</ThemeText>
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center'}}>
        <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
      </View>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Lap Times</ThemeText>
        <ThemeText style={{textAlign: 'center', margin: 10}}>See your laptimes tracked by Athlos lap swim mode below</ThemeText>
        { currentDay.lapTimes.length === 0 ? <ThemeText style={{color: 'grey'}}>No auto-tracked laps swum today with lap swim mode</ThemeText>: null}
      </View>
      <ScrollView
        horizontal
        style={{marginTop: 20}}
        contentContainerStyle={[styles.sideScrollContent, {marginLeft: activityJson.activityData.length === 0 ? -20 : 0}]}
      >
        <LineProgression
          activityColor={COLOR_THEMES.SWIM_THEME}
          yAxisInterval='10'
          xAxisInterval='10'
          yAxisUnits='s'
          data={makeTimeData()}
          labels={[]}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Interval Times</ThemeText>
        <ThemeText style={{textAlign: 'center', margin: 10}}>See the interval times of the swimming workout you created below</ThemeText>
        { !currentDay.workouts || currentDay.workouts.length === 0 ? <ThemeText style={{color: 'grey'}}>No swimming interval workouts for today</ThemeText>: null}
      </View>
      <ScrollView
        horizontal
        style={{marginTop: 20}}
        contentContainerStyle={[styles.sideScrollContent, {marginLeft: activityJson.activityData.length === 0 ? -20 : 0}]}
      >
        <LineProgression
          activityColor={COLOR_THEMES.SWIM_THEME}
          yAxisInterval='10'
          xAxisInterval='10'
          yAxisUnits='s'
          data={makeSwimWorkoutTimeData()}
          labels={[]}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Stroke Distribution</ThemeText>
      </View>
      <View>
        <DistributionDonut
          activity='swim'
          style={{height: 250}}
          data={makeDonutData()}
          indexToLabel={['Fly', 'Back', 'Breast', 'Free', 'Unknown', 'Other']}
          labelUnit=' laps'
          gradients={COLOR_THEMES.SWIM_DONUT_GRADIENTS}
        />
      </View>
      <View style={{alignItems: 'center'}}>
        <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
      </View>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Weekly Swims</ThemeText>
      </View>
      <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
        <WeeklyBarChart
          labels={weeklyGraphLabels}
          data={weeklyGraphData}
          activity="Swims"
          yAxisMin={0}
          yAxisMax={Math.max(...weeklyGraphData)}
        />
      </ScrollView>
      {/* <View style={{alignItems: 'center'}}>
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average laps per session'
          stat={calcAvgNum()}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average Speed'
          stat={`${calcAvgSpeed()} ${unitSystem === "metric" ? "m/s" : "yd/s"}`}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Avg Time per Lap'
          stat={`${calcAvgTimePerLap()} s`}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Avg Cals burned per Session'
          stat={calcAvgCals()}
        />
      </View> */}
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
    marginTop: 10,
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

export default gestureHandlerRootHOC(withFitnessPage(Swim))
