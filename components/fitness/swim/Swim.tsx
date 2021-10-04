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
    makeProgressionData,
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

  const timeData = React.useMemo((): Array<number> => {
    if (!currentDay) return [];
    let laptimeTimeSeries: Array<number> = makeProgressionData(currentDay.lapTimes.map(({lapTime}, _) => lapTime));
    return laptimeTimeSeries;
  }, [makeProgressionData, currentDay]);

  const fineTimeData = React.useMemo((): Array<number> => {
    if (!currentDay) return [];
    return currentDay.lapTimes.map(({lapTime}, _) => lapTime);
  }, [currentDay]);

  const swimWorkoutTimeData = React.useMemo((): Array<number> => {
    if (!currentDay) return [];
    let res: Array<number> = [];
    currentDay.workouts?.forEach((workout) => {
      workout.sets.forEach(set => {
        res.push(set.timeIntervalInSeconds);
      });
    });
    res = makeProgressionData(res);
    return res
  }, [currentDay]);

  const fineSwimWorkoutTimeData = React.useMemo((): Array<number> => {
    if (!currentDay) return [];
    let res: Array<number> = [];
    currentDay.workouts?.forEach((workout) => {
      workout.sets.forEach(set => {
        res.push(set.timeIntervalInSeconds);
      });
    });
    return res
  }, [currentDay]);

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
      <View style={{alignItems: 'center', marginBottom: 25}}>
        <ThemeText h4>Lap Times</ThemeText>
        <ThemeText style={{textAlign: 'center', margin: 10}}>See your laptimes tracked by Athlos lap swim mode below</ThemeText>
        { currentDay?.lapTimes.length >= FITNESS_CONSTANTS.MAX_PROGRESSION_DATA ? <ThemeText style={{textAlign: 'center', margin: 10}}>(tap chart for finer data)</ThemeText> : null }
        { currentDay?.lapTimes.length === 0 ? <ThemeText style={{color: 'grey'}}>No auto-tracked laps swum today with lap swim mode</ThemeText>: null}
      </View>
      <TouchableOpacity
        style={{
          alignItems: "center",
          width: '90%',
          borderRadius: 10,
          padding: 10,
          marginLeft: timeData.length === 0 ? -15 : 0,
        }}
        disabled={fineTimeData.length === timeData.length}
        onPress={() => {
          navigation.navigate(FITNESS_CONSTANTS.SWIM_LAP_FINE_DATA_SCREEN, {
            progressionData: fineTimeData,
            progressionLabels: [],
          });
        }}
      >
        <LineProgression
          fixedWidth
          activityColor={COLOR_THEMES.SWIM_THEME}
          yAxisInterval={10}
          xAxisInterval={10}
          yAxisUnits='s'
          data={timeData}
          labels={[]}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Interval Times</ThemeText>
        <ThemeText style={{textAlign: 'center', margin: 10}}>See the interval times of the swimming workout you created below</ThemeText>
        <ThemeText style={{textAlign: 'center', margin: 10}}>(tap chart for finer data)</ThemeText>
        { !currentDay.workouts || currentDay.workouts.length === 0 ? <ThemeText style={{color: 'grey'}}>No swimming interval workouts for today</ThemeText>: null}
      </View>
      <TouchableOpacity
        style={{
          alignItems: "center",
          width: '90%',
          borderRadius: 10,
          padding: 10,
          marginLeft: timeData.length === 0 ? -20 : 0,
        }}
        disabled={fineSwimWorkoutTimeData.length === swimWorkoutTimeData.length}
        onPress={() => {
          navigation.navigate(FITNESS_CONSTANTS.SWIM_LAP_FINE_DATA_SCREEN, {
            progressionData: fineSwimWorkoutTimeData,
            progressionLabels: [],
          });
        }}
      >
        <LineProgression
          fixedWidth
          activityColor={COLOR_THEMES.SWIM_THEME}
          yAxisInterval={10}
          xAxisInterval={10}
          yAxisUnits='s'
          data={swimWorkoutTimeData}
          labels={[]}
        />
      </TouchableOpacity>
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
      <WeeklyBarChart
        labels={weeklyGraphLabels}
        data={weeklyGraphData}
        activity="Swims"
        yAxisMin={0}
        yAxisMax={Math.max(...weeklyGraphData)}
      />
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
