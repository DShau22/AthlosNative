import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { Text, TextInput, View, Button } from 'react-native';

import Athlos from '../Athlos';
import SignIn from './SignIn';
import SignUp from './SignUp';

const RootStack = createStackNavigator();

const RootStackScreen = ({navigation}) => (
  <RootStack.Navigator headerMode='none'>
    <RootStack.Screen name="Athlos" component={Athlos} options={{title: "AOIWjdoaijwdioawd"}}/>
    <RootStack.Screen name="SignIn" component={SignIn}/>
    <RootStack.Screen name="SignUp" component={SignUp}/>
  </RootStack.Navigator>
);

export default RootStackScreen;