import React from 'react'
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-elements'
import { UserDataContext, ProfileContext, AppFunctionsContext } from '../../../Context'
import PROFILE_CONSTANTS from '../ProfileConstants'
import COMMUNITY_CONSTANTS from '../../community/CommunityConstants'
const { 
  IS_RIVAL,
  IS_FOLLOWER,
  IS_FOLLOWING,
  IS_SELF,

  IS_FOLLOWER_PENDING,
  IS_FOLLOWING_PENDING,
  IS_RIVAL_PENDING,
  UNRELATED
} = PROFILE_CONSTANTS
const {
  UNFOLLOW,
  REMOVE_FOLLOWER,
  REJECT_FOLLOWER_REQUEST,
  CANCEL_FOLLOW_REQUEST,
  ACCEPT_FOLLOWER_REQUEST,
} = COMMUNITY_CONSTANTS

import GLOBAL_CONSTANTS from '../../GlobalConstants'
import ThemeText from '../../generic/ThemeText'

import { useTheme } from '@react-navigation/native';
import { followerAction, storeNewFollowers } from '../../community/communityFunctions/followers'
import { cancelFollowRequest, unfollow, storeNewFollowing } from '../../community/communityFunctions/following'
import FollowerButton from '../actionButtons/FollowerButton'
import SelfButton from '../actionButtons/SelfButton'
import UnrelatedButton from '../actionButtons/UnrelatedButton'
import FollowingButton from '../actionButtons/FollowingButton'
import { capitalize } from '../../utils/strings';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
EvilIcons.loadFont();
// consists of
// 1. profile picture
// 2. Number of followers, following, and rivals => 
//    tap to go to community/(followers or following or rivals, show discover only if its user)
// 3. Relationship status/action (follower, following rival) => on tap bring up modal from bottom for more actions

const ProfileHeader = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  const profileContext = React.useContext(ProfileContext);
  const appFunctionsContext = React.useContext(AppFunctionsContext);
  const {
    firstName,
    lastName,
    followers,
    following,
    rivals,
    relationshipStatus,
    profilePicture,

    _id
  } = profileContext
  const { profileURL } = profileContext.profilePicture
  const { setAppState } = appFunctionsContext
  const { colors } = useTheme();
  const searchUserInfo = {
    _id: _id,
    firstName: firstName,
    lastName: lastName,
    profilePicUrl: profilePicture.profileURL
  }
  // console.log('user info: ', searchUserInfo)
  // tracks whether or not the user tapped on the friend action button
  // button will be disabled or will load after this
  const [buttonLoading, setButtonLoading] = React.useState(false)
  
  //  these are specifically only for follower requests
  const [acceptButtonLoading, setAcceptButtonLoading] = React.useState(false)
  const [rejectButtonLoading, setRejectButtonLoading] = React.useState(false)
  // map for relationship status to button text
  const relationshipMap = {}
  relationshipMap[IS_SELF] = <SelfButton navigation={props.navigation}/>
  relationshipMap[IS_FOLLOWER] = <FollowerButton follower={searchUserInfo}/>
  relationshipMap[IS_FOLLOWING] = {
    initText: 'Following',
    action: async () => {
      setButtonLoading(true);
      try {
        await unfollow({_id: _id})
        const newAppState = await storeNewFollowing({_id: _id}, UNFOLLOW, userDataContext)
        setAppState(newAppState)
      } catch(e) {
        console.log(e)
      } finally {
        setButtonLoading(false);
      }
    },
  }
  relationshipMap[IS_FOLLOWER_PENDING] = {
    initText: 'Sent you a request',
    action: () => console.log("accept"),
  }
  relationshipMap[IS_FOLLOWING] = <FollowingButton searchUser={searchUserInfo} relationshipStatus={IS_FOLLOWING} />
  relationshipMap[IS_FOLLOWING_PENDING] = <FollowingButton searchUser={searchUserInfo} relationshipStatus={IS_FOLLOWING_PENDING} />
  relationshipMap[UNRELATED] = <UnrelatedButton searchUser={searchUserInfo}/>
  // intial text on the button
  const [buttonText, setButtonText] = React.useState(relationshipMap[relationshipStatus].initText)

  const renderCommunityButton = (toScreen, topText, bottomText) => (
    <TouchableOpacity
      style={styles.communityButton}
      onPress={() => {
        props.navigation.push(GLOBAL_CONSTANTS.COMMUNITY, { screen: toScreen })
      }}
    >
      <ThemeText h4>{topText}</ThemeText>
      <ThemeText>{bottomText}</ThemeText>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container]}>
      <TouchableOpacity
        style={{position: 'absolute', right: 25}}
        onPress={() => {
          props.navigation.navigate(GLOBAL_CONSTANTS.SETTINGS)
        }}
      >
        <EvilIcons name='gear' color={colors.textColor} size={45}/>
      </TouchableOpacity>
      <View style={styles.topContainer}>
        <View style={styles.imageContainer}>
          <Image 
            style={styles.profilePic}
            source={profileURL.length > 0 ? {uri: profileURL} : require('../../assets/default_profile.png')}
            // defaultSource={{uri: imgAlt}}
          />
        </View>
        {/* <View style={styles.communityContainer}>
          { renderCommunityButton(COMMUNITY_CONSTANTS.FOLLOWERS, followers.length, 'Followers') }
          { renderCommunityButton(COMMUNITY_CONSTANTS.FOLLOWING, following.length, 'Following') }
          { renderCommunityButton(COMMUNITY_CONSTANTS.RIVALS, rivals.length, 'Rivals') }
        </View> */}
      </View>
      <Text h4 style={[styles.nameText, {color: colors.textColor}]}>{`${capitalize(firstName)} ${capitalize(lastName)}`}</Text>
      {/* {relationshipMap[relationshipStatus]} */}
      {/* <Button
        title={relationshipMap[relationshipStatus].initText}
        containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
        buttonStyle={{backgroundColor: colors.button}}
        onPress={relationshipMap[relationshipStatus].action}
        loading={buttonLoading}
        disabled={!relationshipMap[relationshipStatus].action}
      /> */}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    // paddingTop: 20,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  editButtonContainer: {
    margin: 15,
  },
  editButton: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  topContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    // flexDirection: 'column',
    // alignItems: 'center',
    // flex: 1,
    // marginLeft: 20,
    // backgroundColor: 'blue'
  },
  communityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginRight: 20,
    // backgroundColor: 'red',
  },
  communityButton: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  nameContainer: {
    alignItems: 'center'
  },
  nameText: {
    marginTop: 10,
    marginLeft: 20,
  },
  settingsButtonStyle: {
    position: 'absolute',
  }
})
export default ProfileHeader
