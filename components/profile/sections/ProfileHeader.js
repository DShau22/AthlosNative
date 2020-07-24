import React from 'react'
import { View, StyleSheet, Image, Button } from 'react-native'
import { Text } from 'react-native-elements'
import PROFILE_CONSTANTS from '../ProfileConstants'
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import COMMUNITY_CONSTANTS from '../../community/CommunityConstants'
// consists of
// 1. profile picture
// 2. Number of followers, following, and rivals => 
//    tap to go to community/(followers or following or rivals, show discover only if its user)
// 3. Relationship status/action (follower, following rival) => on tap bring up modal from bottom for more actions

const ProfileHeader = (props) => {
  const { 
    profileURL,
    firstName,
    lastName,
    numFollowers,
    numFollowing,
    numRivals,
    relationshipStatus,
    navigation,
    settings,
  } = props;
  console.log(relationshipStatus)
  return (
    <View style={styles.container}>
      <View style={styles.imageAndStatusContainer}>
        <View style={styles.imageAndNameContainer}>
          <Image 
            style={styles.profilePic}
            source={{uri: profileURL}}
            // defaultSource={{uri: imgAlt}}
          />
          <Text style={styles.nameText}>{`${firstName} ${lastName}`}</Text>
        </View>
        { relationshipStatus === PROFILE_CONSTANTS.IS_SELF ?
          <Button
            buttonStyle={styles.editButton}
            title="Edit Profile"
            onPress={() => {
              props.navigation.navigate(PROFILE_CONSTANTS.EDIT_PROFILE)
            }}
          />
          : <Text>should insert relationship status button here</Text>
        }
      </View>
      <View style={styles.communityContainer}>
        <Button
            buttonStyle={styles.communityButton}
            title={`Followers  ${numFollowers}`}
            onPress={() => {
              props.navigation.push(GLOBAL_CONSTANTS.COMMUNITY, { screen: COMMUNITY_CONSTANTS.FOLLOWERS })
            }}
          />
        <Button
          buttonStyle={styles.communityButton}
          title={`Following  ${numFollowing}`}
          onPress={() => {
            props.navigation.push(GLOBAL_CONSTANTS.COMMUNITY, { screen: COMMUNITY_CONSTANTS.FOLLOWING })
          }}
        />
        <Button
          buttonStyle={styles.communityButton}
          title={`Rivals  ${numRivals}`}
          onPress={() => {
            props.navigation.push(GLOBAL_CONSTANTS.COMMUNITY, { screen: COMMUNITY_CONSTANTS.RIVALS })
          }}
        />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },
  imageAndStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  imageAndNameContainer: {
    flexDirection: 'column'
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
    fontSize: 30,
  },
  communityContainer: {
    flexDirection: 'row',
  },
  communityButton: {
    color: 'red'
  },
})
export default ProfileHeader
