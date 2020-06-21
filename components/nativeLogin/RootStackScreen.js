import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Background from './Background';
import SignIn from './SignIn';
import SignUp from './SignUp';

const RootStack = createStackNavigator();

const RootStackScreen = ({navigation}) => (
  <RootStack.Navigator headerMode='none'>
    <RootStack.Screen name="Background" component={Background}/>
    <RootStack.Screen name="SignIn" component={SignIn}/>
    <RootStack.Screen name="SignUp" component={SignUp}/>
  </RootStack.Navigator>
);

export default RootStackScreen;