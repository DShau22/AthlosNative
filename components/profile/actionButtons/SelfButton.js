import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import PROFILE_CONSTANTS from '../ProfileConstants'
const SelfButton = (props) => {
  const { colors } = useTheme()
  return (  
    <Button
      title='Edit Profile'
      containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
      buttonStyle={{backgroundColor: colors.button}}
      onPress={() => props.navigation.push(PROFILE_CONSTANTS.EDIT_PROFILE)}
    />
  )
}

export default SelfButton;
const styles = StyleSheet.create({

})