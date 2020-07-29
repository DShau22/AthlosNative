import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react'
import { View, ScrollView, StyleSheet, Alert, SectionList, Settings } from 'react-native'
import { Button } from 'react-native-paper';
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { UserDataContext, SettingsContext } from "../../../Context"
import LoadingScreen from "../../generic/LoadingScreen"
import { useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SETTINGS_CONSTANTS from '../SettingsConstants'
const {
  COMMUNITY_SETTINGS,
  FITNESS_SETTINGS,
  BESTS_SETTINGS,
  TOTALS_SETTINGS,
  BASIC_INFO_SETTINGS,
  UNIT_SYSTEM_SETTINGS,
  SWIM_SETTINGS,
} = SETTINGS_CONSTANTS

const SettingsMenu = (props) => {
  const settingsContext = React.useContext(SettingsContext);
  const settingsList = [
    {
      title: "Settings",
      data: [
        {
          title: COMMUNITY_SETTINGS,
          subtitle: 'Who can see your friends list?',  
        },
        {
          title: FITNESS_SETTINGS,
          subtitle: 'Who can see your fitness?',
        },
        {
          title: BESTS_SETTINGS,
          subtitle: 'Who can see your basic info?',
        },
        {
          title: TOTALS_SETTINGS,
          subtitle: 'Who can see your basic info?',
        },
        {
          title: BASIC_INFO_SETTINGS,
          subtitle: 'Who can see your basic info?',
        },
        {
          title: UNIT_SYSTEM_SETTINGS,
          subtitle: 'Unit system to display',
        },
        {
          title: SWIM_SETTINGS,
          subtitle: 'Default swimming pool length'
        },
      ]
    },
  ]
  return (
    <View style={styles.container}>
      <Button
        style={styles.saveButton}
        mode="contained"
        onPress={props.saveSettings}
      >
        Save Settings
      </Button>
      <SectionList
        sections={settingsList}
        keyExtractor={(obj, idx) => obj.title}
        renderItem={({ item }) => (
          <ListItem
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            bottomDivider
            onPress={() => {
              console.log("pressed")
              props.navigation.navigate(item.title)
            }}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 22,
    backgroundColor: "#fff"
  },
  scrollContents: {

  },
  spinnerTextStyle: {
    fontSize: 22,
    color: 'black'
  },
  saveButton: {
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    height: 50,
  }
})

export default gestureHandlerRootHOC(SettingsMenu)