import React from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TextInput } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
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
  const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
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
    if (currentDay.workouts.length === 0) {
      return (
        <View>
          <ThemeText style={{fontSize: 16, color: colors.backgroundOffset, margin: 10, alignSelf: 'center'}}>
            {`No HIIT workouts for ${formatDateToDisplay(currentDay.uploadDate)}`}
          </ThemeText>
        </View>
      )
    }
    const workoutComponents = currentDay.workouts.map((workout, idx) => (
      <View style={{
        flex: 1,
        padding: 10,
        marginBottom: 40,
      }}>
        <ThemeText h4>Workout Date</ThemeText>
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

  // CALENDAR STUFF BELOW
  const getCurrDate = (): string => {
    if (sessionDay) {
      let dateString = DateTime.fromISO(sessionDay.uploadDate)
      let monthString = dateString.month < 10 ? `0${dateString.month}` : `${dateString.month}`;
      let dayString = dateString.day < 10 ? `0${dateString.day}` : `${dateString.day}`;
      return `${dateString.year}-${monthString}-${dayString}`;
    } else {
      return Date();
    }
  }

  // for calendar
  var sessionDay: any;
  if (activityJson.activityData.length > 0 && activityJson.activityData[weekIndex].length >= dayIndex) {
    sessionDay = activityJson.activityData[weekIndex][dayIndex];
  }
  const getMarkedDates = () => {
    let currDay: string = getCurrDate();
    let res: Object = {};
    res[currDay] = {selected: true};
    return res;
  }
  // for calendar
  const getMaxSelectableDate = () => {
    const today = DateTime.local();
    let monthString = today.month < 10 ? `0${today.month}` : `${today.month}`;
    let dayString = today.day < 10 ? `0${today.day}` : `${today.day}`;
    return `${today.year}-${monthString}-${dayString}`;
  }

  const onChangeCalendarDay = (day: number, month: number, year: number) => {
    if (!sessionDay) {
      return;
    }
    const today = DateTime.local();
    const currDay = DateTime.fromISO(sessionDay.uploadDate, {zone: today.zone}).set({
      hour: 0, minute: 0, second: 0, millisecond: 0
    });
    const selectedDay = DateTime.fromObject({day, month, year}, {zone: today.zone});
    let diffInDays = currDay.diff(selectedDay, ['days']).toObject().days;
    let absDiffInDays = Math.abs(diffInDays);
    let dayOffset = absDiffInDays % 7;
    if (diffInDays < 0) {
      // we must be forwards in time
      let weekOffset = Math.floor(absDiffInDays / 7) + Math.floor((dayIndex + dayOffset) / 7);
      setWeekIndex(weekIndex - weekOffset);
      setDayIndex((dayIndex + dayOffset) % 7);
    } else if (diffInDays > 0) {
      // we must go backwards in time
      let weekOffset = Math.floor(absDiffInDays / 7) + ((dayIndex - dayOffset) < 0 ? 1 : 0);
      setWeekIndex(weekIndex + weekOffset);
      setDayIndex((dayIndex - dayOffset + 7) % 7);
    }
  }

  return (
    <>
      <ScrollView
        style={{height: '100%', width: '100%', backgroundColor: colors.background}}
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing}
            onRefresh={props.onRefresh}
          />
        }
      >
        <TouchableOpacity
          style={{
            alignItems: "center",
            alignSelf: 'center',
            width: '90%',
            borderRadius: 10,
            backgroundColor: colors.backgroundOffset,
            padding: 10,
            marginTop: 20,
          }}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <ThemeText>{`${showCalendar ? 'Escape' : 'Show'} Calendar View`}</ThemeText>
        </TouchableOpacity>
        {showCalendar ?
          <Calendar
            markedDates={getMarkedDates()}
            maxDate={getMaxSelectableDate()}
            current={getCurrDate()}
            style={{
              marginTop: 20,
              alignSelf: 'center',
              width: GLOBAL_CONSTANTS.SCREEN_WIDTH - 20,
              // backgroundColor: 'red'
            }}
            onDayPress={(day) => {
              onChangeCalendarDay(day.day, day.month, day.year);
              setShowCalendar(false);
            }}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.backgroundOffset,
              dayTextColor: '#ffffff',
              todayTextColor: '#ffffff',
              textDisabledColor: '#8c8d8f',
              // dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#ffffff',
              monthTextColor: '#ffffff',
              // indicatorColor: 'blue',
            }}
          />
        : renderWorkouts()}
      </ScrollView>
      {showCalendar ? null : 
        <>
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
      }
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