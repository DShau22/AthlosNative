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
  const { onItemPress, itemList, pendingList, pendingTitle, peopleTitle, pendingSubtitle, peopleSubtitle } = props
  const { setAppState } = React.useContext(AppFunctionsContext);
  const userDataContext = React.useContext(UserDataContext);
  const withSections = [
    {
      title: pendingTitle,
      data: pendingList
    },
    {
      title: peopleTitle,
      data: itemList
    }
  ]
  return (
    <View style={styles.container}>
      <SectionList
        sections={withSections}
        keyExtractor={(item, idx) => item._id}
        // CONSIDER CHANGING THIS TO JUST INCLUDE THE LISTEM. THEN PUT ALL REQUEST FUNCTION
        // STUFF INTO HERE IT'LL BE A PHAT COMPONENT THO
        renderItem={({ item, section, index }) => (
          <props.listItem
            item={item}
            section={section}
            onItemPress={onItemPress}
            setAppState={setAppState}
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