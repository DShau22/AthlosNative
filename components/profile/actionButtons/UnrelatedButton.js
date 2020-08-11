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
import {follow, storeNewFollowing} from '../../community/communityFunctions/following'
import COMMUNITY_CONSTANTS from '../../community/CommunityConstants'
const {
  FOLLOW
} = COMMUNITY_CONSTANTS

export default function UnrelatedButton(props) {
  const { searchUser } = props
  const { colors } = useTheme()
  const [showModal, setShowModal] = React.useState(false)
  const [actionTaken, setActionTaken] = React.useState(false)
  const userDataContext = React.useContext(UserDataContext)
  const appFunctionsContext = React.useContext(AppFunctionsContext)
  const { setAppState } = appFunctionsContext
  const followUser = async () => {
    try {
      setActionTaken(true)
      await follow(searchUser, FOLLOW, userDataContext);
      const newState = await storeNewFollowing(searchUser, FOLLOW, userDataContext);
      setAppState(newState)
      Alert.alert('All Done!', `You sent a follower request to ${searchUser.firstName}!`, [{text: 'Ok'}])
    } catch(e) {
      console.log(e)
      Alert.alert('Oh No :(', e.toString(), [{text: 'Ok'}])
    } finally {
      setActionTaken(false)
    }
  }

  return (
    <>
      <Button
        title='Follow'
        containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
        buttonStyle={{backgroundColor: colors.button}}
        onPress={followUser}
      />
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