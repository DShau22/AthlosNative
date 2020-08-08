import React from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { Text, Button, Divider } from 'react-native-elements'
import { UserDataContext, ProfileContext } from '../../../Context'
import PROFILE_CONSTANTS from '../ProfileConstants'
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
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import COMMUNITY_CONSTANTS from '../../community/CommunityConstants'
import ThemeText from '../../generic/ThemeText'

import { TouchableOpacity } from 'react-native-gesture-handler'
import GradientButton from '../../generic/GradientButton'
import { useTheme } from '@react-navigation/native';

// consists of
// 1. profile picture
// 2. Number of followers, following, and rivals => 
//    tap to go to community/(followers or following or rivals, show discover only if its user)
// 3. Relationship status/action (follower, following rival) => on tap bring up modal from bottom for more actions

const ProfileHeader = (props) => {
  const profileContext = React.useContext(ProfileContext);
  const {
    firstName,
    lastName,
    followers,
    following,
    rivals,
    relationshipStatus,
  } = profileContext
  const { profileURL } = profileContext.profilePicture
  const { colors } = useTheme();
  // tracks whether or not the user tapped on the friend action button
  // button will be disabled or will load after this
  const [buttonLoading, setButtonLoading] = React.useState(false)

  // map for relationship status to button text
  const relationshipMap = {}
  console.log(relationshipStatus)
  relationshipMap[IS_SELF] = {
    text: 'Edit Profile',
    action: () => props.navigation.push(PROFILE_CONSTANTS.EDIT_PROFILE),
  }
  relationshipMap[IS_FOLLOWER] = {
    text: 'Remove Follower',
    action: () => props.navigation.push(PROFILE_CONSTANTS.EDIT_PROFILE),
  }
  relationshipMap[IS_FOLLOWING] = {
    text: 'Unfollow',
    action: () => console.log("unfollow"),
  }
  relationshipMap[IS_FOLLOWER_PENDING] = {
    text: 'Accept Request',
    action: () => console.log("accept"),
  }
  relationshipMap[IS_FOLLOWING_PENDING] = {
    text: 'Request Sent',
  }
  relationshipMap[UNRELATED] = {
    text: 'Follow',
    action: () => console.log("accept"),
  }
  // renders either a follow button, edit profile button, 
  // or an inactive following/follower button (challenge later)
  const renderRelationshipAction = () => {
    return (
      <Button
        title='Edit Profile'
        containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
        buttonStyle={{backgroundColor: colors.button}}
        onPress={relationshipToAction[relationshipStatus]}
      />
    )
  }
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
      <View style={styles.topContainer}>
        <View style={styles.imageContainer}>
          <Image 
            style={styles.profilePic}
            source={{uri: profileURL}}
            // defaultSource={{uri: imgAlt}}
          />
        </View>
        <View style={styles.communityContainer}>
          { renderCommunityButton(COMMUNITY_CONSTANTS.FOLLOWERS, followers.length, 'Followers') }
          { renderCommunityButton(COMMUNITY_CONSTANTS.FOLLOWING, following.length, 'Following') }
          { renderCommunityButton(COMMUNITY_CONSTANTS.RIVALS, rivals.length, 'Rivals') }
        </View>
      </View>
      <Text h4 style={[styles.nameText, {color: colors.textColor}]}>{`${firstName} ${lastName}`}</Text>
      <Button
        title={relationshipMap[relationshipStatus].text}
        containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
        buttonStyle={{backgroundColor: colors.button}}
        onPress={relationshipMap[relationshipStatus].action}
        loading={buttonLoading}
        disabled={!relationshipMap[relationshipStatus].action}
      />
      <Divider style={styles.divider}/>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    // paddingTop: 20,
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  divider: {
    marginLeft: 8,
    marginRight: 8,
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
    // justifyContent: 'space-around'
  },
  imageContainer: {
    flexDirection: 'column',
    // alignItems: 'center',
    flex: 1,
    marginLeft: 20,
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
})
export default ProfileHeader
