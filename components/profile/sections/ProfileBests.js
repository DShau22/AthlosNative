import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Divider } from 'react-native-elements';
import { UserDataContext, ProfileContext } from '../../../Context';
import { useTheme } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
FontAwesome.loadFont();
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
MaterialIcon.loadFont();
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Feather from 'react-native-vector-icons/dist/Feather';
Feather.loadFont();
import CustomIcon from '../../../CustomIcons';
CustomIcon.loadFont();

import GLOBAL_CONSTANTS from '../../GlobalConstants'
import { inchesToCm, roundToDecimal } from '../../utils/unitConverter'
import ProfileSectionGrid from './ProfileSectionGrid';

const { METRIC, ENGLISH } = GLOBAL_CONSTANTS

const ProfileBests = (props) => {
  // const { highestJump, mostLaps, mostSteps, bestEvent } = props
  const userDataContext = React.useContext(UserDataContext);
  const profileContext = React.useContext(ProfileContext);
  const { highestJump, mostLaps, mostSteps, bestEvent, mostCalories } = profileContext.bests
  const unitSystem = userDataContext.settings.unitSystem;

  const inchesOrCm = unitSystem === METRIC ? 'cm' : 'in';
  const jumpDisplay = unitSystem === METRIC ? 
    `${roundToDecimal(inchesToCm(highestJump), 1)} ${inchesOrCm}` : `${highestJump} ${inchesOrCm}`;

  const { colors } = useTheme();
  const gridElements = [
    {
      icon: <Feather name='chevrons-up' size={30} color={colors.textColor}/>,
      textDisplay: jumpDisplay,
      textDisplayTitle: 'Best Vertical'
    },
    {
      icon: <MaterialCommunityIcons name='shoe-print' size={30} color={colors.textColor}/>,
      textDisplay: mostSteps,
      textDisplayTitle: 'Most Steps'
    },
    {
      icon: <CustomIcon name='swimmer' size={30} color={colors.textColor}/>,
      textDisplay: mostLaps,
      textDisplayTitle: 'Most Laps'
    },
    {
      icon: <MaterialCommunityIcons name='fire' size={30} color={colors.textColor}/>,
      textDisplay: mostCalories,
      textDisplayTitle: 'Most Calories'
    },
  ]
  
  return (
    <View style={styles.container}>
      <ProfileSectionGrid
        gridElements={gridElements}
        sectionTitle='Session Bests'
      />
    </View>
  )
}

export default ProfileBests;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    // backgroundColor: 'red'
  },
  divider: {
    marginLeft: 8,
    marginRight: 8,
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
    // backgroundColor: 'blue',
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