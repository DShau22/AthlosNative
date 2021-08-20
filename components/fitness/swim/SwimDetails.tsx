import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { Text, Button, colors } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { SwimSchema } from '../data/UserActivities';
import ThemeText from '../../generic/ThemeText';
import { formatDateToDisplay } from '../../utils/dates';
import { calcSwimWorkouts, calcLapSwimWorkout, calcSwimGroups, displayClass, SwimSet, STROKE_TO_COLOR, SwimmingWorkout } from './utils';
import { PoolLengthsEnum } from '../FitnessTypes';
import { COLOR_THEMES } from '../../ColorThemes';
import FITNESS_CONSTANTS from '../FitnessConstants';

interface LapSwimDetailsProps {
  swim: SwimSchema
  onRefresh?: () => void,
  refreshing?: boolean,
  navigation?: any,
};

const SwimDetails: React.FC<LapSwimDetailsProps> = (props) => {
  const { 
    lapTimes,
    strokes,
    time,
    uploadDate,
    workouts,
  } = props.swim;
  if (workouts) {
    console.log("swim stuff: ", workouts[0].sets);
  }
  const { refreshing, onRefresh, navigation } = props;
  const renderHeader = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 25}}>
        <TouchableOpacity
          onPress={() => navigation?.navigate(FITNESS_CONSTANTS.SWIM)}
          style={{marginLeft: 10}}
        >
          <ThemeText bold style={{fontSize: 32}}>&#8592;</ThemeText>
        </TouchableOpacity>
        <ThemeText h4 style={{marginTop: 10, marginLeft: 10}}>{`${formatDateToDisplay(uploadDate)} Swims`}</ThemeText>
      </View>
    )
  }
  const { colors } = useTheme();
  const lapSwimWorkoutData: Array<SwimSet> = calcLapSwimWorkout(calcSwimGroups(lapTimes, strokes, PoolLengthsEnum.NCAA));
  const swimWorkoutData: Array<SwimmingWorkout> = calcSwimWorkouts(workouts);

  const createSectionListData = (lapSwimWorkoutData: Array<SwimSet> , swimWorkoutData: Array<SwimmingWorkout>) => {
    var sectionListData = lapSwimWorkoutData.length > 0 ? [{
      title: "Lap Swimming Workout",
      roundsCompletedDisplay: '',
      subtitle: "automatically recoreded when lap swim mode was on.",
      ifNoData: "No lap swimming recorded",
      data: lapSwimWorkoutData
    }] : [];
    if (swimWorkoutData.length > 0) {
      swimWorkoutData.forEach((workout) => {
        sectionListData.push({
          title: `Swimming Interval Workout`,
          roundsCompletedDisplay: `Rounds completed: ${workout.numRoundsDone}/${workout.numRoundsIntended}`,
          subtitle: "Your recorded progress on a swimming interval workout you created with the app.",
          ifNoData: "No Swimming workout recorded",
          data: workout.sets
        });
      });
    }
    return sectionListData;
  }
  return (
    // <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
    <SectionList
      ListHeaderComponent={renderHeader()}
      sections={createSectionListData(lapSwimWorkoutData, swimWorkoutData)}
      onRefresh={onRefresh}
      refreshing={refreshing}
      keyExtractor={item => `${item.averageTime}`}
      style={{width: '100%'}}
      // contentContainerStyle={{alignItems: 'center'}}
      renderSectionHeader={({ section: { title, subtitle, roundsCompletedDisplay } }) => {
        if (lapSwimWorkoutData.length > 0 || swimWorkoutData.length > 0) {
          return (
            <View>
              <ThemeText h4 style={{margin: 5}}>{title}</ThemeText>
              {roundsCompletedDisplay?.length > 0 ? <ThemeText bold style={{fontSize: 18, margin: 5}}>{roundsCompletedDisplay}</ThemeText> : null}
              <ThemeText style={{fontSize: 16, margin: 5}}>{subtitle}</ThemeText>
            </View>
          );
        } else {
          return (<ThemeText style={{fontSize: 16, margin: 25}}>No swims for this day</ThemeText>);
        }
      }}
      renderItem={({ item }) => {
        if (item.numSwims === 0) {
          return null;
        }
        return (
          <View style={{
            height: 65,
            margin: 10,
            width: '90%',
            backgroundColor: colors.backgroundOffset,
            justifyContent: "center",
            borderRadius: 8,
          }}>
            <View style={{
              backgroundColor: COLOR_THEMES.SWIM_THEME,
              position: 'absolute',
              left: -1,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderColor: 'white',
              borderWidth: 1,
              width: '6%',
              height: '100%',
            }}></View>
            <ThemeText style={{left: '8%'}}>
              {`${item.numSwims} x ${item.distance}s ${displayClass(item.class)}`}
            </ThemeText>
          </View>
        )
      }}
    />
  );
}

export default SwimDetails;
const styles = StyleSheet.create({

});