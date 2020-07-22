import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import { View, StyleSheet, SectionList, Animated, Dimensions } from 'react-native'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import ActionButton from "../ActionButton"
import { AppFunctionsContext, UserDataContext } from '../../../Context'
import COMMUNITY_CONSTANTS from '../CommunityConstants'
const { DISAPPEAR_TIME } = COMMUNITY_CONSTANTS
// RIGHT NOW THIS DISPLAYS FRIENDS where friends is the field in Mongo
const CommunityList = (props) => {
  const { onItemPress, sectionList, showActionButton } = props
  const { setAppState } = React.useContext(AppFunctionsContext);
  const userDataContext = React.useContext(UserDataContext);
  return (
    <View style={styles.container}>
      <SectionList
        sections={sectionList}
        keyExtractor={(item, idx) => item._id}
        renderItem={({ item, section, index }) => (
          <props.listItem
            item={item}
            section={section}
            onItemPress={onItemPress}
            setAppState={setAppState}
            showActionButton={showActionButton}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
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
})
export default gestureHandlerRootHOC(CommunityList)