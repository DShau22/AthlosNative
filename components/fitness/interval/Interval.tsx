import React from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TextInput } from 'react-native-paper';
import { FitnessPageProps } from '../withFitnessPage';
import ThemeText from '../../generic/ThemeText';
import { ActivityJson } from '../FitnessTypes';
import { SettingsType } from '../../generic/UserTypes';
import { IntervalWorkoutSchema, IntervalType, IntervalSchema } from '../data/UserActivities';
import { MUSCLE_GROUP_LIST } from '../../configure/DeviceConfigConstants';
import Arrow from '../carousel/Arrow';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { DateTime } = require("luxon");

type IntervalProps = {
  activityJson: ActivityJson,
  settings: SettingsType,
  dayIndex: number,
  setDayIndex: Function,
  weekIndex: number,
  setWeekIndex: Function,
}

const Interval: React.FC<IntervalProps> = (props) => {
  const LIST_VIEW = "list view";
  const WORKOUT_VIEW = "workout view";
  const {
    weekIndex,
    dayIndex,
    setWeekIndex,
    setDayIndex,
    settings,
    activityJson
  } = props;
  // placeholder
  // var currentDay = {
  //   workouts: [
  //     {
  //       intervalsCompleted: [
  //         {
  //           lengthInSeconds: 30,
  //           exercise: MUSCLE_GROUP_LIST[2]
  //         },
  //         {
  //           lengthInSeconds: 30,
  //           exercise: MUSCLE_GROUP_LIST[3]
  //         },
  //         {
  //           lengthInSeconds: 30,
  //           exercise: MUSCLE_GROUP_LIST[2]
  //         },
  //         {
  //           lengthInSeconds: 30,
  //           exercise: MUSCLE_GROUP_LIST[3]
  //         },
  //       ],
  //       totalRoundsPlanned: 2,
  //       intervalsPerRoundPlanned: 2,
  //       workoutName: "My HIIT Workout",
  //       workoutTime: 60,
  //     }
  //   ]
  // }
  var currentDay: IntervalSchema = activityJson.activityData[weekIndex][dayIndex];
  const [currentWorkout, setCurrentWorkout] = React.useState<IntervalWorkoutSchema>(currentDay.workouts[0]);
  const { colors } = useTheme();

  const renderIntervals = (workout: IntervalWorkoutSchema) => {
    const {
      intervalsCompleted,
      intervalsPerRoundPlanned,
      totalRoundsPlanned,
    } = workout;
    console.log("per round planned: ", intervalsPerRoundPlanned);
    const totalIntervalsCompleted = intervalsCompleted.length;
    const res = [];
    for (let i = 0; i < intervalsPerRoundPlanned; i++) {
      var minutesDisplay = "";
      var secondsDisplay = "";
      var completedDisplay = `Completed: ${0}/${totalRoundsPlanned}`;
      var exerciseDisplay = "unfinished";
      var timeDisplay = ":(";
      var interval: IntervalType;
      var numCompletedForThisExercise = 0;
      if (i < intervalsCompleted.length) {
        const exerciseNumber = (i % intervalsPerRoundPlanned) + 1;
        interval = intervalsCompleted[i];
        minutesDisplay = interval.lengthInSeconds >= 60 ? `${Math.floor(interval.lengthInSeconds / 60)} min` : '';
        secondsDisplay = interval.lengthInSeconds % 60 != 0 ? `${interval.lengthInSeconds % 60} sec` : '';
        timeDisplay = minutesDisplay.length > 0 ? `${minutesDisplay} ${secondsDisplay}` : secondsDisplay;
        numCompletedForThisExercise = 1 + Math.floor((totalIntervalsCompleted - exerciseNumber)/intervalsPerRoundPlanned);
        completedDisplay = `Completed: ${numCompletedForThisExercise}/${totalRoundsPlanned}`;
        exerciseDisplay = interval.exercise;
      }
      res.push(
        <View style={{
          padding: 5,
          marginTop: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: numCompletedForThisExercise === totalRoundsPlanned ? '#9cffb6' : '#fc6868', // red if incomplete, green if completed
          width: '94%',
          alignSelf: 'center',
        }}>
          <ListItem
            containerStyle={[{width: '100%', backgroundColor: colors.background}]}
          >
            <ListItem.Content>
              <ListItem.Title style={{}}>
                <ThemeText>{exerciseDisplay}</ThemeText>
              </ListItem.Title>
              <ListItem.Subtitle>
                <ThemeText>{timeDisplay}</ThemeText>
              </ListItem.Subtitle>
            </ListItem.Content>
            <ThemeText>{completedDisplay}</ThemeText>
          </ListItem>
        </View>
      );
    }
    return res;
  }

  const Stack = createStackNavigator();
  const dateObject = DateTime.fromISO(currentDay.uploadDate);
  return (
    <View style={{height: '100%', width: '100%', backgroundColor: colors.background}}>
      {currentDay.workouts.length === 0 ? 
        <View>
          <ThemeText style={{fontSize: 16, color: colors.backgroundOffset, margin: 10, alignSelf: 'center'}}>
            {`No HIIT workouts for ${dateObject.weekdayShort}, ${dateObject.month}/${dateObject.day}`}
          </ThemeText>
        </View>
      : currentDay.workouts.map((workout, idx) => (
        <View style={{
          flex: 1,
          padding: 10,
          marginBottom: 40,
        }}>
          <ThemeText h4>Workout name</ThemeText>
          <TextInput
            mode='outlined'
            value={workout.workoutName} // should be workoutName
            outlineColor={colors.backgroundOffset}
            selectionColor={colors.backgroundOffset}
            underlineColor={colors.backgroundOffset}
            style={{ backgroundColor: colors.backgroundOffset }}
            theme={{ colors: { primary: colors.textColor, text: colors.textColor }}}
            disabled // TODO: ALLOW USERS TO EDIT THE NAMES OF THEIR WORKOUTS PER DAY
          />
          {/* Progress Bar */}
          <ThemeText>insert progress bar here</ThemeText>
          <ThemeText h4>{`Rounds completed: ${Math.floor(workout.intervalsCompleted.length / workout.intervalsPerRoundPlanned)}/${workout.totalRoundsPlanned}`}</ThemeText>
          <ThemeText h4>Intervals</ThemeText>
          {renderIntervals(workout)}
        </View>
      ))}
    </View>
  )
}

export default Interval;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 22,
    backgroundColor: "#fff"
  },
  saveButton: {
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 50,
  }
});