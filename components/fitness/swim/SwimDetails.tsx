import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, colors } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { SwimSchema } from '../data/UserActivities';
import ThemeText from '../../generic/ThemeText';
import { formatDateToDisplay } from '../../utils/dates';
import { StrokeTimeType } from './utils';

interface LapSwimDetailsProps {
  workout: SwimSchema
};

const SwimDetails: React.FC<LapSwimDetailsProps> = (props) => {
  const { 
    lapTimes,
    strokes,
    time,
    uploadDate
  } = props.workout;

  const { colors } = useTheme();
  const listData: Array<StrokeTimeType> = lapTimes.map((timeObject, idx) => (
    {stroke: strokes[idx], lapTime: timeObject.lapTime, finished: timeObject.finished}
  ));

  return (
    <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
      <ThemeText h4 style={{marginTop: 25}}>{`${formatDateToDisplay(uploadDate)} Swim`}</ThemeText>
      { listData.length > 0 ? <FlatList
        data={listData}
        renderItem={({ item }) => (
          <View style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <View style={{
              backgroundColor: 'red',
              position: 'absolute',
              left: -1,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderColor: 'white',
              borderWidth: 1,
              width: '6%',
              height: '100%',
            }}></View>
            <ThemeText>
              {`${item}`}
            </ThemeText>
          </View>
        )}
      /> : <ThemeText style={{fontSize: 16, margin: 25}}>No swims for this day</ThemeText>}
    </View>
  )
}

export default SwimDetails;
const styles = StyleSheet.create({

});