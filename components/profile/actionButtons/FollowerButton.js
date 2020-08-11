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
import {followerAction, storeNewFollowers} from '../../community/communityFunctions/followers'
import COMMUNITY_CONSTANTS from '../../community/CommunityConstants'
const {
  REMOVE_FOLLOWER
} = COMMUNITY_CONSTANTS

export default function FollowerButton(props) {
  const { follower } = props
  const { colors } = useTheme()
  const [showModal, setShowModal] = React.useState(false)
  const [actionTaken, setActionTaken] = React.useState(false)
  const userDataContext = React.useContext(UserDataContext)
  const appFunctionsContext = React.useContext(AppFunctionsContext)
  const { setAppState } = appFunctionsContext
  const removeFollower = async () => {
    try {
      setActionTaken(true)
      await followerAction(follower, REMOVE_FOLLOWER, userDataContext);
      const newState = await storeNewFollowers(follower, REMOVE_FOLLOWER, userDataContext);
      setAppState(newState)
      Alert.alert('All Done!', `${follower.firstName} no longer follows you.`, [{text: 'Ok'}])
      setShowModal(false)
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
        title='Follower'
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
            <TouchableOpacity
              onPress={removeFollower}
            >
              <ThemeText h4>Remove Follower</ThemeText>
            </TouchableOpacity>
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