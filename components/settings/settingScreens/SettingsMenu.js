import React, { Component } from 'react'
import { View, ScrollView, StyleSheet, Alert, SectionList, Settings } from 'react-native'
import { Button } from 'react-native-paper';
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { UserDataContext, SettingsContext } from "../../../Context"
import LoadingScreen from "../../generic/LoadingScreen"
import { useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import Spinner from 'react-native-loading-spinner-overlay';
import {
  getData,
} from '../../utils/storage';

import UnitSystemMenu from "../dropdown-menus/UnitSystemMenu"
import PoolLengthMenu from "../dropdown-menus/PoolLengthMenu"
import PrivacyMenu from "../dropdown-menus/PrivacyMenu"
import PoolLengthPopup from "../PoolLengthPopup"

import ENDPOINTS from '../../endpoints'

const SettingsMenu = (props) => {
  const settingsContext = React.useContext(SettingsContext);
  const settingsList = [
    {
      title: "Settings",
      data: [
        {
          title: FRIENDS_SETTINGS,
          subtitle: 'Who can see your friends list?',  
        },
        {
          title: FITNESS_SETTINGS,
          subtitle: 'Who can see your fitness?',
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
        onPress={settingsContext.saveSettings}
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
            // leftAvatar={{ source: { uri: item.avatar_url } }}
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
    // <ScrollView
    //   contentContainerStyle={styles.scrollContents}
    //   style={styles.container}
    // >
    //   {settingsList.map((item, idx) => (
    //     <ListItem
    //       key={idx}
    //       title={item.title}
    //       subtitle={item.subtitle}
    //       // leftAvatar={{ source: { uri: item.avatar_url } }}
    //       bottomDivider
    //       chevron
    //       onPress={() => {
    //         console.log("pressed")
    //         props.navigation.navigate(item.title)
    //       }}
    //     />
    //   ))}

    //   {/* <PoolLengthPopup 
    //     showCustomSwimSettings={state.showCustomSwimSettings}
    //     closeCustomSwimSettings={closeCustomSwimSettings}
    //     onCustomSwimLengthChange={onCustomSwimLengthChange}
    //     setCustomSwimUnits={setCustomSwimUnits}
    //     setCustomSwimLength={setCustomSwimLength}
    //     customSwimUnits={state.customSwimUnits}
    //   />
    //   <ul className='settings-list'>
    //     <li className='settings-list-item'>
    //       <i
    //         className="fa help-icon"
    //         data-toggle="tooltip"
    //         data-placement="top"
    //         title={friendsListHelpMsg}
    //       >
    //         &#xf059;
    //       </i>
    //       <span className='setting-text'>Who can see your friends list?</span>
    //       {renderDropDown(friendsListID, settings.seeFriendsList)}
    //     </li>
    //     <li className='settings-list-item'>
    //       <i
    //         className="fa help-icon"
    //         data-toggle="tooltip"
    //         data-placement="top"
    //         title={fitnessHelpMsg}
    //       >
    //         &#xf059;
    //       </i>
    //       <span className='setting-text'>Who can see your fitness?</span>
    //       {renderDropDown(fitnessID, settings.seeFitness)}
    //     </li>
    //     <li className='settings-list-item'>
    //       <i
    //         className="fa help-icon"
    //         data-toggle="tooltip"
    //         data-placement="top"
    //         title={basicInfoHelpMsg}
    //       >
    //         &#xf059;
    //       </i>
    //       <span className='setting-text'>Who can see your basic info?</span>
    //       {renderDropDown(basicInfoID, settings.seeBasicInfo)}
    //     </li>
    //     <li className='settings-list-item'>
    //       <i
    //         className="fa help-icon"
    //         data-toggle="tooltip"
    //         data-placement="top"
    //         title={unitSystemHelpMsg}
    //       >
    //         &#xf059;
    //       </i>
    //       <span className='setting-text'>Unit system to display</span>
    //       {renderDropDown(unitSystemID, settings.unitSystem)}
    //     </li>
    //     <li className='settings-list-item'>
    //       <i
    //         className="fa help-icon"
    //         data-toggle="tooltip"
    //         data-placement="top"
    //         title={lapSwimHelpMsg}
    //       >
    //         &#xf059;
    //       </i>
    //       <span className='setting-text'>Default swimming pool length</span>
    //       {renderDropDown(swimLapID, settings.swimLap)}
    //     </li>
    //     <li className='settings-list-item' id='save-settings-list-item'>
    //       <div className='help-icon empty-space'></div>
    //       <div className='setting-text empty-space'></div>
    //       <div className='save-settings'>
    //         <button 
    //           className='save-settings-btn btn btn-primary'
    //           onClick={saveSettings}
    //         >
    //           Save
    //         </button>
    //       </div>
    //     </li>
    //   </ul>
    //   {displayErrors()}
    //   {displaySuccesses()} */}
    // </ScrollView>
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

const FRIENDS_SETTINGS = 'Friends Settings'
const FITNESS_SETTINGS = 'Fitness Settings'
const BASIC_INFO_SETTINGS = 'Basic Info Settings'
const UNIT_SYSTEM_SETTINGS = 'Unit System Settings'
const SWIM_SETTINGS = 'Swimming Settings'

export default SettingsMenu