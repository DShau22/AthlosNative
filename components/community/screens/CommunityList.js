import React from 'react'
import { View, StyleSheet, SectionList } from 'react-native'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import ActionButton from "../ActionButton"
import { AppFunctionsContext, UserDataContext } from '../../../Context'
// RIGHT NOW THIS DISPLAYS FRIENDS where friends is the field in Mongo
const CommunityList = (props) => {
  const { onItemPress, itemList, pendingList, pendingTitle, peopleTitle, pendingSubtitle, peopleSubtitle } = props
  const { setAppState } = React.useContext(AppFunctionsContext);
  const userDataContext = React.useContext(UserDataContext);
  const withSections = [
    {
      title: pendingTitle,
      data: pendingList
      // data: []
    },
    {
      title: peopleTitle,
      data: itemList
      // data: []
    }
  ]
  return (
    <View style={styles.container}>
      <SectionList
        sections={withSections}
        keyExtractor={(item, idx) => item._id}
        renderItem={({ item, section }) => props.listItem({item, section, onItemPress, setAppState, userDataContext})}
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
    // alignItems: 'center',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 22,
    backgroundColor: "#fff"
  },
})
export default CommunityList