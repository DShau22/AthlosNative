import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import * as Progress from 'react-native-progress';

interface SyncProgressCircleProps {
  syncProgress: number
};

const SyncProgressCircle: React.FC<SyncProgressCircleProps> = ({ syncProgress }) => {
  return (
    <Progress.Circle color={"#ffffff"} progress={syncProgress}/>
  )
}

export default SyncProgressCircle;
const styles = StyleSheet.create({

});