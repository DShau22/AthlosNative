import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View } from 'react-native';
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

import { UserDataContext, ProfileContext } from '../../../Context';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS;
import ProfileSectionGrid from './ProfileSectionGrid';
import { inchesToCm, roundToDecimal } from '../../utils/unitConverter'

const ProfileGoals = (props) => {
  const { colors } = useTheme();
  const userDataContext = React.useContext(UserDataContext);
  const { unitSystem } = userDataContext.settings
  const profileContext = React.useContext(ProfileContext);

  const { goalSteps, goalLaps, goalVertical, goalCaloriesBurned } = profileContext.goals;
  const goalVerticalDisplay = unitSystem === METRIC ? 
    `${roundToDecimal(inchesToCm(goalVertical), 1)} cm` : `${goalVertical} in`;
  const gridElements = [
    {
      icon: <CustomIcon name='running' size={30} color={colors.textColor}/>,
      textDisplay: goalSteps,
      textDisplayTitle: 'Steps'
    },
    {
      icon: <CustomIcon name='swimmer' size={30} color={colors.textColor}/>,
      textDisplay: goalLaps,
      textDisplayTitle: 'Laps'
    },
    {
      icon: <Feather name='chevrons-up' size={30} color={colors.textColor}/>,
      textDisplay: goalVerticalDisplay,
      textDisplayTitle: 'Best Vertical'
    },
    {
      icon: <MaterialCommunityIcons name='fire' size={30} color={colors.textColor}/>,
      textDisplay: goalCaloriesBurned,
      textDisplayTitle: 'Calories Burned'
    },
  ]

  return (
    <View>
      <ProfileSectionGrid 
        gridElements={gridElements}
        sectionTitle='Weekly Goals'
        onEditPress={() => {
          props.onEditPress();
        }}
      />
    </View>
  )
}

export default ProfileGoals;