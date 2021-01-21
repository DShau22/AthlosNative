import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react';
import { View, SafeAreaView, StyleSheet, Alert, SectionList, TouchableOpacity } from 'react-native';
import { Text, ListItem } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { UserDataContext, SettingsContext } from "../../../Context";
import LoadingScreen from "../../generic/LoadingScreen";
import SETTINGS_CONSTANTS from '../SettingsConstants';
import ThemeText from '../../generic/ThemeText';
import { Platform } from 'react-native';

const {
  COMMUNITY_SETTINGS,
  FITNESS_SETTINGS,
  BESTS_SETTINGS,
  TOTALS_SETTINGS,
  BASIC_INFO_SETTINGS,
  UNIT_SYSTEM_SETTINGS,
  SWIM_SETTINGS,
  DEVICE_SETTINGS
} = SETTINGS_CONSTANTS

const SettingsMenu = (props) => {
  const settingsContext = React.useContext(SettingsContext);
  const { colors } = useTheme();
  const settingsList = [
    {
      title: "Settings",
      data: [
        {
          title: UNIT_SYSTEM_SETTINGS,
          subtitle: 'Unit system to display',
        },
        {
          title: DEVICE_SETTINGS,
          subtitle: 'Unlink your Athlos earbuds',
        },
        // {
        //   title: SWIM_SETTINGS,
        //   subtitle: 'Default swimming pool length'
        // },
        // {
        //   title: COMMUNITY_SETTINGS,
        //   subtitle: 'Who can see your friends list?',  
        // },
        // {
        //   title: FITNESS_SETTINGS,
        //   subtitle: 'Who can see your fitness?',
        // },
        // {
        //   title: BESTS_SETTINGS,
        //   subtitle: 'Who can see your basic info?',
        // },
        // {
        //   title: TOTALS_SETTINGS,
        //   subtitle: 'Who can see your basic info?',
        // },
        // {
        //   title: BASIC_INFO_SETTINGS,
        //   subtitle: 'Who can see your basic info?',
        // },
      ]
    },
  ]
  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <SectionList
        sections={settingsList}
        renderSectionHeader={({section}) => {
          return (
            <View style={[styles.header, {backgroundColor: colors.background}]}>
              <ThemeText style={{fontSize: 20}}>{section.title}</ThemeText>
            </View>
          );
        }}
        keyExtractor={(obj, idx) => obj.title}
        renderItem={({ item }) => (
          <ListItem
            containerStyle={{backgroundColor: colors.background}}
            key={item.title}
            bottomDivider
            topDivider
            onPress={() => {
              props.navigation.navigate(item.title)
            }}
          >
            <ListItem.Content style={{backgroundColor: colors.background}}>
              <ListItem.Title><ThemeText>{item.title}</ThemeText></ListItem.Title>
              <ListItem.Subtitle><ThemeText>{item.subtitle}</ThemeText></ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color={colors.textColor}/>
          </ListItem>
        )}
      />
      <TouchableOpacity
        style={[styles.saveButton, {backgroundColor: colors.button}]}
        onPress={props.saveSettings}
      >
        <ThemeText>Save Settings</ThemeText>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 22,
    backgroundColor: "#fff"
  },
  spinnerTextStyle: {
    fontSize: 22,
    color: 'black'
  },
  saveButton: {
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 50,
  }
})

export default gestureHandlerRootHOC(SettingsMenu)