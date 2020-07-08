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
      // data: []
    },
    {
      title: peopleTitle,
      data: itemList
      // data: []
    }
  ]
  // stores the animation starting point for list items
  const INIT_OPACITY = 1
  const [animation, _] = React.useState(new Animated.Value(INIT_OPACITY))
  // flag to animate only the list items that succeeded
  const [idxsToAnimate, setIdxsToAnimate] = React.useState([])
  // animates the disappearance of a user list item
  const disappear = () => {
    const disappearAnimations = [
      Animated.timing(animation, {
        toValue: 0,
        duration: DISAPPEAR_TIME,
        useNativeDriver: true
      }),
    ];
    Animated.sequence(disappearAnimations).start()
  }
  console.log("oaiwjdioawd ", idxsToAnimate)
  return (
    <View style={styles.container}>
      <SectionList
        sections={withSections}
        keyExtractor={(item, idx) => item._id}
        // CONSIDER CHANGING THIS TO JUST INCLUDE THE LISTEM. THEN PUT ALL REQUEST FUNCTION
        // STUFF INTO HERE IT'LL BE A PHAT COMPONENT THO
        renderItem={({ item, section, index }) => (
          <Animated.View
            key={index}
            style={{
              opacity: idxsToAnimate.includes(index) ? animation : INIT_OPACITY
            }}
          >
            {props.listItem({item, section, onItemPress, setAppState, userDataContext, disappear, setIdxsToAnimate, index})}
          </Animated.View>
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