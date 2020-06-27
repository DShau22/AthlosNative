import React from 'react'
import { View, StyleSheet, SectionList } from 'react-native'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import ActionButton from "../ActionButton"
// RIGHT NOW THIS DISPLAYS FRIENDS where friends is the field in Mongo
const CommunityList = (props) => {
  const { onItemPress, itemList, pendingList, pendingTitle, peopleTitle, pendingSubtitle, peopleSubtitle } = props
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
        keyExtractor={(item, idx) => item.id}
        renderItem={({ item, section }) => (
          <ListItem
            key={item.id}
            title={`${item.firstName} ${item.lastName}`}
            subtitle={section.title === 'Requests' ? pendingSubtitle : peopleSubtitle}
            // MAKE THIS THEIR PHOTO. USE CLOUDINARY URL
            // leftAvatar={{ source: { uri: item.avatar_url } }}

            // MAKE THIS THE FOLLOW/ACCEPT BUTTON
            rightElement={() => (
              <ActionButton
                title='hello'
                afterPressTitle='bye'
                onPress={() => {
                  console.log("freind button pressed")
                }}
              />
            )}
            bottomDivider
            onPress={() => {
              console.log("friend pressed")
              // get the user's profile and display based on their settings
              onItemPress(item)
            }}
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