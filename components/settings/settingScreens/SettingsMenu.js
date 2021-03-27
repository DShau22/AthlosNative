import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react';
import { View, SafeAreaView, StyleSheet, Alert, SectionList, TouchableOpacity } from 'react-native';
import { Text, ListItem } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { AppContext } from "../../../Context";
import LoadingScreen from "../../generic/LoadingScreen";
import SETTINGS_CONSTANTS from '../SettingsConstants';
import ThemeText from '../../generic/ThemeText';
import { Platform } from 'react-native';
import { logOut } from '../../utils/storage';
import GlobalBleHandler from '../../bluetooth/GlobalBleHandler';
import { showSnackBar } from '../../utils/notifications';
import { UserActivities } from '../../fitness/data/UserActivities';

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
  const setToken = React.useContext(AppContext);
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
          subtitle: 'Unlink your earbuds or change auto-syncing',
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
    <SafeAreaView style={[styles.container, {flex: 1}]}>
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
            onPress={async () => {
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
        ListFooterComponent={() => (
          <ListItem
            topDivider
            bottomDivider
            containerStyle={{backgroundColor: colors.backgroundColor}}
            onPress={() => {
              Alert.alert(
                "Sign out?",
                "You'll be logged out of your account on this device",
                [
                  {text: 'Cancel'},
                  {
                    text: 'Okay',
                    onPress: async () => {
                      try {
                        // upload anything to server that's stored
                        await UserActivities.uploadStoredOldRecords();
                        await logOut();
                        setToken("");
                      } catch(e) {
                        console.log(e);
                        showSnackBar(`Error 111: Something went wrong with the sign out process. Please try again later and make sure your interent connection is strong ${e}`);
                      }
                    }
                  }
                ]

              )
            }}
          >
            <ListItem.Content>
              <ListItem.Title>
                <ThemeText>Sign Out</ThemeText>
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        )}
      />
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