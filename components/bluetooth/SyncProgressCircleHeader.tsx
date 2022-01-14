import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ThemeText from '../generic/ThemeText';
import * as Progress from 'react-native-progress';
import GLOBAL_CONSTANTS from '../GlobalConstants';

interface SyncProgressCircleHeaderProps {
  headerText: string,
  syncProgress: number,
};

const SyncProgressCircleHeader: React.FC<SyncProgressCircleHeaderProps> = ({ headerText, syncProgress }) => {
  return (
    <View style={styles.container}>
      <ThemeText style={styles.headerTextStyle} bold>{headerText}</ThemeText>
      { syncProgress >= 0 ? <Progress.Circle color={"#ffffff"} progress={syncProgress} style={styles.progressCircleStyle}/> : null } 
    </View>
  )
}

const styles = Platform.OS === 'ios' ? StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: GLOBAL_CONSTANTS.SCREEN_WIDTH, height: '100%'
  },
  headerTextStyle: {
    fontSize: 20,
    marginLeft: 10,
  },
  progressCircleStyle: {
    marginRight: 10,
    marginBottom: 3,
  }
}) : StyleSheet.create({
  container: {
    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTextStyle: {fontSize: 20,},
  progressCircleStyle: {}
});

export default SyncProgressCircleHeader;