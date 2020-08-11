import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native'
import { Text, Button, ListItem } from 'react-native-elements'
import { ActivityIndicator, Colors } from 'react-native-paper';

import { useTheme } from '@react-navigation/native';
// popup stuff
import Modal, {
  BottomModal,
  ModalContent,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';
import { UserDataContext, AppFunctionsContext } from '../../../Context'
import ThemeText from '../../generic/ThemeText'
import {unfollow, storeNewFollowing, cancelFollowRequest} from '../../community/communityFunctions/following'
import COMMUNITY_CONSTANTS from '../../community/CommunityConstants'
import PROFILE_CONSTANTS from '../ProfileConstants'
const {
  CANCEL_FOLLOW_REQUEST,
  UNFOLLOW
} = COMMUNITY_CONSTANTS
const { 
  IS_FOLLOWING,
  IS_FOLLOWING_PENDING,
} = PROFILE_CONSTANTS

export default function FollowingButton(props) {
  const { searchUser, relationshipStatus } = props
  const { colors } = useTheme()
  const [showModal, setShowModal] = React.useState(false)
  const [actionTaken, setActionTaken] = React.useState(false)
  const userDataContext = React.useContext(UserDataContext)
  const appFunctionsContext = React.useContext(AppFunctionsContext)
  const { setAppState } = appFunctionsContext
  const unfollowUser = async () => {
    try {
      setActionTaken(true)
      await unfollow(searchUser);
      const newState = await storeNewFollowing(searchUser, UNFOLLOW, userDataContext);
      setAppState(newState)
      Alert.alert('All Done!', `You no longer aweifawoeijfo ${searchUser.firstName}.`, [{text: 'Ok'}])
      setShowModal(false)
    } catch(e) {
      console.log(e)
      Alert.alert('Oh No :(', e.toString(), [{text: 'Ok'}])
    } finally {
      setActionTaken(false)
    }
  }

  const cancelUserFollowRequest = async () => {
    try {
      setActionTaken(true)
      await cancelFollowRequest(searchUser);
      const newState = await storeNewFollowing(searchUser, CANCEL_FOLLOW_REQUEST, userDataContext);
      setAppState(newState)
      Alert.alert('All Done!', `Your follow request to ${searchUser.firstName} has been canceled.`, [{text: 'Ok'}])
      setShowModal(false)
    } catch(e) {
      console.log(e)
      Alert.alert('Oh No :(', e.toString(), [{text: 'Ok'}])
    } finally {
      setActionTaken(false)
    }
  }

  // either you follow this person, or you sent a request to follow them
  const isFollowing = relationshipStatus === IS_FOLLOWING
  return (
    <>
      <Button
        title={isFollowing ? 'You Follow' : 'Follow request sent'}
        containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
        buttonStyle={{backgroundColor: colors.button}}
        onPress={() => setShowModal(true)}
      />
      <BottomModal
        visible={showModal}
        onTouchOutside={() => setShowModal(false)}
        modalTitle={
          <ModalTitle
            title='some title'
            align="center"
          />
        }
        height={.20}
        width={1}
      >
        <ModalContent style={{height: 100}}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            {isFollowing ? 
              <TouchableOpacity
                onPress={unfollowUser}
              >
                <ThemeText h4>unfollow</ThemeText>
              </TouchableOpacity> :

              <TouchableOpacity
                onPress={cancelUserFollowRequest}
              >
                <ThemeText h4>Cancel follow request</ThemeText>
              </TouchableOpacity>
            }
            <ActivityIndicator animating={actionTaken} color={colors.header}/>
          </View>
        </ModalContent>
      </BottomModal>
    </>
  )
}

const styles = StyleSheet.create({
  listItemStyle: {
    marginTop: 10,
  },
  modeTitleStyles: {
    width: '100%',
    color: 'white'
  },
  modeSubtitleStyles: {
    width: '100%',
    color: 'white'
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    borderRadius: 8
  }
})