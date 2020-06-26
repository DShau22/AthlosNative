import React from 'react'
import Run from "./run/Run"
import Jump from "./jump/Jump"
import Swim from "./swim/Swim"
import { UserDataContext } from "../../Context"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoadingScreen from '../generic/LoadingScreen';
import { View, StyleSheet } from "react-native";
import { useFocusEffect } from '@react-navigation/native';


const Fitness = (props) => {
  var [display, setDisplay] = React.useState(true);
  var [activityDisplay, setActivityDisplay] = React.useState('');
  const context = React.useContext(UserDataContext);
  useFocusEffect(
    React.useCallback(() => {

    }, [])
  );
  const TopTab = createMaterialTopTabNavigator();
  return (
    <TopTab.Navigator style={styles.topTab}>
      <TopTab.Screen
        name="Run"
        component={Run}
        initialParams={{
          id: "run",
          activityJson: context.runJson
        }}
      />
      <TopTab.Screen
        name="Swim"
        component={Swim}
        initialParams={{
          id: "swim",
          activityJson: context.swimJson
        }}
      />
      <TopTab.Screen
        name="Jump"
        component={Jump}
        initialParams={{
          id: "jump",
          activityJson: context.jumpJson
        }}
      />
    </TopTab.Navigator>
  )
}

const styles = StyleSheet.create({
  topTab: {

  }
})

export default Fitness;
