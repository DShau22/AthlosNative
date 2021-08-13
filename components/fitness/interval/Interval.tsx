import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';
import { FitnessPageProps } from '../withFitnessPage';
import ThemeText from '../../generic/ThemeText';

type Workout = {
  workoutName: string
}

const Interval: React.FC<FitnessPageProps> = (props) => {
  const {
    weekIndex,
    dayIndex,
    weeklyGraphData,
    weeklyGraphLabels,
    calcAvgNum,
    calcAvgCals,

    settings,
    activityJson
  } = props;
  var { currentDay } = props;
  // placeholder
  currentDay = {
    workoutName: "My HIIT Workout",
    totalRounds: 4,
    roundsCompleted: 3,
    intervals: [
      {
        time: 90,
        muscleGroup: "abs",
      }
    ]
  }
  currentDay = currentDay as Workout;
  const [workoutName, setWorkoutName] = React.useState<string>(currentDay.workoutName);
  const { colors } = useTheme();

  const renderIntervals = (intervals: Array<any>) => {
    return intervals.map((interval, _) => {
      const minutesDisplay = interval.time >= 60 ? `${Math.floor(interval.time / 60)} min` : '';
      const secondsDisplay = interval.time % 60 != 0 ? `${interval.time % 60} sec` : '';
      const timeDisplay = minutesDisplay.length > 0 ? `${minutesDisplay} ${secondsDisplay}` : secondsDisplay;
      return (
        <View style={{
          padding: 5,
          marginTop: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'red', // red if incomplete, green if completed
          width: '94%',
          alignSelf: 'center',
        }}>
          <ListItem
            containerStyle={[{width: '100%', backgroundColor: colors.background}]}
          >
            <ListItem.Content>
              <ListItem.Title style={{}}>
                <ThemeText>{interval.muscleGroup}</ThemeText>
              </ListItem.Title>
              <ListItem.Subtitle>
                <ThemeText>{timeDisplay}</ThemeText>
              </ListItem.Subtitle>
            </ListItem.Content>
            <ThemeText>{`Completed: ${3}/${4}`}</ThemeText>
          </ListItem>
        </View>
      );
    });
  }
  return (
    <View style={{
      padding: 10,
    }}>
      <ThemeText h4>Workout Name</ThemeText>
      <TextInput
        mode='outlined'
        value={workoutName} // should be workoutName
        onChangeText={text => setWorkoutName(text)}
        outlineColor={colors.backgroundOffset}
        selectionColor={colors.backgroundOffset}
        underlineColor={colors.backgroundOffset}
        style={{ backgroundColor: colors.backgroundOffset }}
        theme={{ colors: { primary: colors.textColor, text: colors.textColor }}}
      />
      {/* Progress Bar */}
      <ThemeText>insert progress bar here</ThemeText>
      <ThemeText h4>{`Rounds completed: ${currentDay.roundsCompleted}/${currentDay.totalRounds}`}</ThemeText>
      <ThemeText h4>Intervals</ThemeText>
      {renderIntervals(currentDay.intervals)}
    </View>
  )
}

export default Interval;
const styles = StyleSheet.create({

});