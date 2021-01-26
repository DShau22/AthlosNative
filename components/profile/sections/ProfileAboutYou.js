import React from 'react';
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

import { UserDataContext, ProfileContext } from '../../../Context';
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import { inchesToCm, poundsToKg, englishHeight } from '../../utils/unitConverter'
import ProfileSectionGrid from './ProfileSectionGrid';

const { METRIC, ENGLISH } = GLOBAL_CONSTANTS;

const ProfileAboutYou = (props) => {
  const { colors } = useTheme();
  const userDataContext = React.useContext(UserDataContext);
  const profileContext = React.useContext(ProfileContext);

  const { age, weight, height, gender, } = profileContext;
  const unitSystem = userDataContext.settings.unitSystem.toLowerCase();
  const displayHeight = unitSystem === METRIC ?
    `${Math.round(inchesToCm(height))} cm` : englishHeight(height);
  const displayWeight = unitSystem === METRIC ?
    `${Math.round(poundsToKg(weight) * 10) / 10} kg` : `${weight} lbs`;
  
  const gridElements = [
    {
      icon: <MaterialCommunityIcons name='human-male-height' size={30} color={colors.textColor}/>,
      textDisplay: height > 0 ? displayHeight : '?',
      textDisplayTitle: 'Height'
    },
    {
      icon: <MaterialCommunityIcons name='scale' size={30} color={colors.textColor}/>,
      textDisplay: weight > 0 ? displayWeight : '?',
      textDisplayTitle: 'Weight'
    },
    {
      icon: <FontAwesome name='birthday-cake' size={30} color={colors.textColor}/>,
      textDisplay: age > 0 ? age : '?',
      textDisplayTitle: 'Age'
    },
    {
      icon: <FontAwesome name='transgender-alt' size={30} color={colors.textColor}/>,
      textDisplay: gender.length > 0 ? gender : '?',
      textDisplayTitle: 'Gender'
    },
  ]

  return (
    <ProfileSectionGrid 
      gridElements={gridElements}
      sectionTitle='About You'
      onEditPress={() => {
        props.onEditPress();
      }}
    />
  )
}

export default ProfileAboutYou;