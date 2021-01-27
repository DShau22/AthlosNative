import { useTheme } from '@react-navigation/native';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

export default function LoadingScreen(props) {
  const { colors } = useTheme();
  return (
    <View style={styles}>
      <Spinner
        visible={true}
        textContent={props.text}
        textStyle={{color: colors.textColor}}
      />
    </View>
  )
}

const styles = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
}
