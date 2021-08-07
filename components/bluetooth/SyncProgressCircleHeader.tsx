import React from 'react';
import { View, StyleSheet } from 'react-native';
import SyncProgressCircle from './SyncProgressCircle';
import ThemeText from '../generic/ThemeText';

interface SyncProgressCircleHeaderProps {
  headerText: string,
  syncProgress: number,
};

const SyncProgressCircleHeader: React.FC<SyncProgressCircleHeaderProps> = ({ headerText, syncProgress }) => {
  return (
    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
      <ThemeText style={{fontSize: 20}} bold>{headerText}</ThemeText>
      { syncProgress >= 0 ? <SyncProgressCircle syncProgress={syncProgress}/> : null } 
    </View>
  )
}

export default SyncProgressCircleHeader;