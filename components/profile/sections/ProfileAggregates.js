import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { UserDataContext, ProfileContext } from '../../../Context';
import { Card, } from 'react-native-paper';
import ThemeText from '../../generic/ThemeText'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';

Icon.loadFont();
import GLOBAL_CONSTANTS from '../../GlobalConstants'

const ProfileAggregates = (props) => {
  const profileContext = React.useContext(ProfileContext);
  const { colors } = useTheme();
  const { totals } = profileContext
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{totals.steps}</ThemeText>
            <ThemeText>Total Steps</ThemeText>
          </View>
        </View>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{totals.laps}</ThemeText>
            <ThemeText>Total Laps</ThemeText>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{totals.verticalJumps}</ThemeText>
            <ThemeText>Total Jumps</ThemeText>
          </View>
        </View>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{totals.calories}</ThemeText>
            <ThemeText>Cals burned</ThemeText>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProfileAggregates;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    // backgroundColor: 'red'
  },
  row: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'row',
    // justifyContent: 'space-around',
    width: '100%'
  },
  gridBox: {
    marginLeft: 30,
    flex: 1,
    // backgroundColor: 'red',
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  gridTextBox: {
    justifyContent: 'center',
    marginLeft: 10
    // alignItems: 'center'
  },
})