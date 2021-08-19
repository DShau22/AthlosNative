import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, colors } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { SwimSchema } from '../data/UserActivities';
import ThemeText from '../../generic/ThemeText';
import { formatDateToDisplay } from '../../utils/dates';
import { calcSwimWorkout, calcSwimGroups, displayClass, SwimRepeatGroup, STROKE_TO_COLOR } from './utils';
import { PoolLengthsEnum } from '../FitnessTypes';
import { COLOR_THEMES } from '../../ColorThemes';
import FITNESS_CONSTANTS from '../FitnessConstants';

interface LapSwimDetailsProps {
  workout: SwimSchema
  onRefresh?: () => void,
  refreshing?: boolean,
  navigation?: any,
};

const SwimDetails: React.FC<LapSwimDetailsProps> = (props) => {
  const { 
    lapTimes,
    strokes,
    time,
    uploadDate
  } = props.workout;
  const { refreshing, onRefresh, navigation } = props;
  const renderHeader = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => navigation?.navigate(FITNESS_CONSTANTS.SWIM)}
          style={{marginLeft: 10}}
        >
          <ThemeText bold style={{fontSize: 32}}>&#8592;</ThemeText>
        </TouchableOpacity>
        <ThemeText h4 style={{marginTop: 10, marginLeft: 10}}>{`${formatDateToDisplay(uploadDate)} Swim`}</ThemeText>
      </View>
    )
  }
  const { colors } = useTheme();
  const workoutData: Array<SwimRepeatGroup> = calcSwimWorkout(calcSwimGroups(lapTimes, strokes, PoolLengthsEnum.NCAA));
  return (
    <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
      { workoutData.length > 0 ? <FlatList
        ListHeaderComponent={renderHeader()}
        data={workoutData}
        onRefresh={onRefresh}
        refreshing={refreshing}
        keyExtractor={item => `${item.averageTime}`}
        style={{width: '100%'}}
        // contentContainerStyle={{alignItems: 'center'}}
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
                {`${item.numSwims} x ${item.swims[0].distance}s ${displayClass(item.swims[0].class)}`}
              </ThemeText>
            </View>
          )
        }
      }
      /> : <ThemeText style={{fontSize: 16, margin: 25}}>No swims for this day</ThemeText>}
    </View>
  )
}

export default SwimDetails;
const styles = StyleSheet.create({

});