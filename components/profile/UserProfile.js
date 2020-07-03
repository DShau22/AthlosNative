// Displays the profile of the user who is logged in on the browser
// They should be able to see everything
import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'
// import {
//   withRouter,
// } from "react-router-dom";
// import ShowMoreText from 'react-show-more-text';

import { UserDataContext } from '../../Context';
import { poundsToKg, inchesToCm } from "../utils/unitConverter"
import PROFILE_CONSTANTS from "./ProfileConstants"
import GLOBAL_CONSTANTS from '../GlobalConstants'
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS
// import "./css/userProfile.css"
// import Popup from "reactjs-popup";
import EditProfileFunc from "./EditProfileFunc"
// replace with default avatar link
const imgAlt = "./default_profile.png"

const UserProfile = (props) => {
  const context = React.useContext(UserDataContext);
  const [expandBio, setExpandBio] = React.useState(false);

  const renderBio = () => {
    var { bio } = context
    const onClick = () => {
      expandBio(true);
    }
    if (!bio) {
      return (
        <p>No bio yet</p>
      )
    }
    return (
      <Text>{bio}</Text>
      // <ShowMoreText
      //   /* Default options */
      //   lines={3}
      //   more='Show more'
      //   less='Show less'
      //   anchorClass=''
      //   onClick={onClick}
      //   expanded={state.expandBio}
      // >
      //   {bio}
      // </ShowMoreText>
    )
  }

  const renderHeight = () => {
    var { height, settings } = context
    var { unitSystem } = settings
    unitSystem = unitSystem.toLowerCase()
    return unitSystem === METRIC ? `${inchesToCm(height)} cm` : `${Math.floor(height / 12)} ft ${height % 12} in`
  }

  const renderWeight = () => {
    var { weight, settings } = context
    var { unitSystem } = settings
    unitSystem = unitSystem.toLowerCase()
    return unitSystem === METRIC ? `${poundsToKg(weight)} kg` : `${weight} lbs`
  }

  const renderBests = () => {
    // calculate bests based off of state and settings
  }

  const renderNumFriends = () => {
    var { friends } = context
    return (
      <p>{"friends: " + friends.length}</p>
    )
  }

  const renderPopup = () => {
    const editBtn = (
      <View className='edit-btn-container'>
        <i className='far'>&#xf044;</i>
        <span className="edit-btn">Edit Profile</span>
      </View>
    )
    return (
      <Text>popup should be here</Text>
      // <Popup trigger={editBtn} modal>
      //   {close => (
      //     <View className="popup-modal">
      //       <View className="popup-close" onClick={close}>
      //         &times;
      //       </View>
      //       <h4 className="popup-header"> Edit your profile </h4>
      //       <View className="content">
      //         <EditProfileFunc closePopup={close}/>
      //       </View>
      //     </View>
      //   )}
      // </Popup>
    )
  }

  // if user clicked the button to go to the edit profile page
  if (context.mounted) {
    return (
      <View className="profile-container">
        <View className='top-half'>
          <Button
            buttonStyle={styles.editButton}
            title="Edit Profile"
            onPress={() => {
              props.navigation.navigate(PROFILE_CONSTANTS.EDIT_PROFILE)
            }}
          />
          <View className='img-container mt-2'>
            <Text>Should contain image</Text>
            <Image 
              style={styles.tinyLogo}
              source={{uri: context.profilePicture.profileURL}}
              // defaultSource={{uri: imgAlt}}
            />
          </View>
          <View className="name-container">
            <Text className='fname'>{context.firstName}</Text>
            <Text className='lname'>{context.lastName}</Text>
          </View>
          <View className='info-container m-3'>
            <View className='row'>
              <View className='col-4'>
                <Text h4>Age</Text>
                <Text>{context.age}</Text>
              </View>
              <View className='col-4'>
                <Text h4>Height</Text>
                <Text>{renderHeight()}</Text>
              </View>
              <View className='col-4'>
                <Text h4>Weight</Text>
                <Text>{renderWeight()}</Text>
              </View>
            </View>
          </View>
          <View className='bio-container m-3'>
            <Text>{renderBio()}</Text>
          </View>
        </View>
        <View className='bot-half'>
          <View className='row'>
            <Text className='col-6'>
              total steps
            </Text>
            <Text className='col-6'>
              total mins
            </Text>
          </View>
          <View className='row'>
            <Text className='col-6'>
              total laps
            </Text>
            <Text className='col-6'>
              hightest jump
            </Text>
          </View>
        </View>
      </View>
    )
  } else {
    // spa hasn't mounted and established context yet
    return (
      <View className="profile-loading-container">
        <Text>Athlos context mounted value should be false?</Text>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  editButton: {
    backgroundColor: 'red',
    width: '80%'
  }
});

export default UserProfile
