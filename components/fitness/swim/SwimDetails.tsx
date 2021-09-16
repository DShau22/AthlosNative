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
    uploadDate,
    workouts,
  } = props.swim;
  const { refreshing, onRefresh, navigation } = props;
  const { colors } = useTheme();
  const lapSwimWorkoutData: Array<SwimSet> = calcLapSwimWorkout(calcSwimGroups(lapTimes, strokes, PoolLengthsEnum.NCAA));
  const swimWorkoutData: Array<SwimmingWorkout> = calcSwimWorkouts(workouts);
  const renderHeader = () => {
    return (
      <View style={{alignItems: 'center', marginBottom: 25}}>
        <ThemeText h4 style={{marginTop: 10, marginLeft: 10 }}>{`${formatDateToDisplay(uploadDate)} Swims`}</ThemeText>
        { lapTimes.length === 0 && workouts?.length === 0 ? <ThemeText style={{margin: 10, fontSize: 20, color: 'grey'}}>No swims for today</ThemeText> : null}
      </View>
    )
  }

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
          subtitle: "Below is your recorded progress on a swimming workout you created with the app.",
          ifNoData: "No Swimming workout recorded",
          data: workout.sets
        });
      });
    }
    return sectionListData;
  }

  const BackButton = <TouchableOpacity
    onPress={() => navigation?.navigate(FITNESS_CONSTANTS.SWIM)}
    style={{
      backgroundColor: colors.backgroundOffset,
      width: '50%',
      height: 50,
      margin: 20,
      borderRadius: 10,
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center'
    }}
  >
    <ThemeText style={{fontSize: 20}}>back</ThemeText>
  </TouchableOpacity>;
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
      ListFooterComponent={BackButton}
      renderSectionHeader={({ section: { title, subtitle, roundsCompletedDisplay } }) => {
        if (lapSwimWorkoutData.length > 0 || swimWorkoutData.length > 0) {
          return (
            <View>
              <ThemeText h4 style={{margin: 5}}>{title}</ThemeText>
              <ThemeText style={{fontSize: 16, margin: 5}}>{subtitle}</ThemeText>
              {roundsCompletedDisplay?.length > 0 ? <ThemeText bold style={{fontSize: 18, margin: 5}}>{roundsCompletedDisplay}</ThemeText> : null}
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
            width: '95%',
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