import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Background from './Background';
import SignIn from './SignIn';
import SignUp from './SignUp';
import PasswordReset from './PasswordReset'
import LOGIN_CONSTANTS from './LoginConstants';
const {
  BACKGROUND,
  SIGNIN,
  SIGNUP,
  FORGOT_PASSWORD
} = LOGIN_CONSTANTS

const RootStack = createStackNavigator();

const RootStackScreen = ({navigation}) => (
  <RootStack.Navigator headerMode='none'>
    <RootStack.Screen name={BACKGROUND} component={Background}/>
    <RootStack.Screen name={SIGNIN} component={SignIn}/>
    <RootStack.Screen name={SIGNUP} component={SignUp}/>
    <RootStack.Screen name={FORGOT_PASSWORD} component={PasswordReset}/>
  </RootStack.Navigator>
);

export default RootStackScreen;