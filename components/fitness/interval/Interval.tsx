import React from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TextInput } from 'react-native-paper';
import { FitnessPageProps } from '../withFitnessPage';
import ThemeText from '../../generic/ThemeText';
import { ActivityJson } from '../FitnessTypes';
import { SettingsType } from '../../generic/UserTypes';
import { IntervalWorkoutSchema, IntervalType, IntervalSchema } from '../data/UserActivities';
import Arrow from '../carousel/Arrow';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
import { formatDateToDisplay } from '../../utils/dates';
const { DateTime } = require("luxon");

type IntervalProps = {
  refreshing: boolean,
  onRefresh: () => void,
  activityJson: ActivityJson,
  settings: SettingsType,
  dayIndex?: number,
  setDayIndex?: Function,
  weekIndex?: number,
  setWeekIndex?: Function,
}

const Interval: React.FC<IntervalProps> = (props) => {
  const EMPTY_DAY: IntervalSchema = {
    userID: "",
    uploadDate: "",
    time: 0,
    uploadedToServer: false,
    workouts: [],
  };
  const {
    settings,
    activityJson
  } = props;
  let {
    weekIndex,
    dayIndex,
    setWeekIndex,
    setDayIndex,
  } = props;
  if (!weekIndex && !setWeekIndex) {
    [weekIndex, setWeekIndex] = React.useState(0);
  }
  if (!dayIndex && !setDayIndex) {
    [dayIndex, setDayIndex] = React.useState(DateTime.local().weekday % 7); // 1 is monday 7 is sunday for .weekday
  }
  var currentDay: IntervalSchema = activityJson.activityData.length > 0 ? activityJson.activityData[weekIndex][dayIndex] : EMPTY_DAY;
  const { colors } = useTheme();

  const nextDay = () => {
    const nextIndex = (dayIndex + 1) % 7;
    setDayIndex(nextIndex);
  }

  const previousDay = () => {
    // 0 represents the most recent upload date
    const nextIndex = (dayIndex - 1 + 7) % 7;
    setDayIndex(nextIndex);
  }

  const renderIntervals = (workout: IntervalWorkoutSchema) => {
    const {
      intervalsCompleted,
      intervalsPerRoundPlanned,
      totalRoundsPlanned,
    } = workout;
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

  const renderWorkouts = () => {
    const workoutComponents = currentDay.workouts.map((workout, idx) => (
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
        <ThemeText h4>{`Rounds completed: ${Math.floor(workout.intervalsCompleted.length / workout.intervalsPerRoundPlanned)}/${workout.totalRoundsPlanned}`}</ThemeText>
        <ThemeText h4>Intervals</ThemeText>
        {renderIntervals(workout)}
      </View>
    ));
    workoutComponents.reverse();
    return workoutComponents;
  }

  return (
    <>
      <ScrollView
        style={{height: '100%', width: '100%', backgroundColor: colors.background}}
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing}
            onRefresh={props.getFitness}
          />
        }
      >
        {currentDay.workouts.length === 0 ? 
          <View>
            <ThemeText style={{fontSize: 16, color: colors.backgroundOffset, margin: 10, alignSelf: 'center'}}>
              {`No HIIT workouts for ${formatDateToDisplay(currentDay.uploadDate)}`}
            </ThemeText>
          </View>
        : renderWorkouts()}
      </ScrollView>
      <Arrow
        style={{position: 'absolute', bottom: 10, left: 30}}
        textStyle={{color: colors.textColor}}
        direction='left'
        clickFunction={previousDay}
        glyph="&#8249;"
      />
      <Arrow
        style={{position: 'absolute', bottom: 10, right: 30}}
        textStyle={{color: colors.textColor}}
        direction='right'
        clickFunction={nextDay}
        glyph="&#8250;"
      />
    </>
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