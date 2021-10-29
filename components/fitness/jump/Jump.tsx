import React from 'react'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import { COLOR_THEMES } from '../../ColorThemes'
import WeeklyBarChart from "../charts/WeeklyBarChart"
import withFitnessPage, { FitnessPageProps } from "../withFitnessPage"
import ThemeText from '../../generic/ThemeText'
import LineProgression from '../charts/LineProgression'
import FITNESS_CONSTANTS from '../FitnessConstants';

const Jump = (props: FitnessPageProps) => {
  const {
    makeProgressionData,
    currentDay,
    weeklyGraphData,
    weeklyGraphLabels,
    navigation,
    
    settings
  } = props;
  const { unitSystem } = settings;

  const progressionData = React.useMemo(() => {
    return currentDay ? makeProgressionData(currentDay.heights) : [];
  }, [makeProgressionData, currentDay]);

  // daily basis
  const makeTimeLabels = (inc: number) => {
    if (!currentDay) {
      return [];
    }
    let res: Array<number> = [];
    for (let i = 0; i < currentDay.heights.length; i+=inc) {
      res.push(i === 0 ? 1 : i);
    }
    return res;
  }

  // this could be undefined if user has no recorded data
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center', marginBottom: 25}}>
        <ThemeText h4>Verticals</ThemeText>
        { currentDay?.heights.length > FITNESS_CONSTANTS.MAX_PROGRESSION_DATA ? <ThemeText style={{textAlign: 'center', margin: 10}}>(tap chart for finer data)</ThemeText> : null }
      </View>
      <TouchableOpacity
        style={{
          alignItems: "center",
          width: '90%',
          borderRadius: 10,
          padding: 10,
          marginLeft: progressionData.length === 0 ? -15 : 0,
        }}
        disabled={currentDay.heights.length === progressionData.length}
        onPress={() => {
          navigation.navigate(FITNESS_CONSTANTS.RUN_FINE_DATA_SCREEN, {
            progressionData: [0, ...currentDay.heights],
            progressionLabels: currentDay ? makeTimeLabels(5) : []
          });
        }}
      >
        <LineProgression
          activityColor={COLOR_THEMES.JUMP_THEME}
          yAxisInterval={4}
          yAxisUnits={unitSystem === GLOBAL_CONSTANTS.METRIC ? ' cm' : ' in'}
          data={progressionData}
          labels={[]}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Weekly Bests</ThemeText>
      </View>
      <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
        <WeeklyBarChart
          labels={weeklyGraphLabels}
          data={weeklyGraphData}
          activity="Jumps"
          yAxisUnits={unitSystem === GLOBAL_CONSTANTS.METRIC ? ' cm' : ' in'}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height: '100%',
    width: '100%',
    // backgroundColor: 'red',
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
    width: '100%'
  }
})
export default gestureHandlerRootHOC(withFitnessPage(Jump))
