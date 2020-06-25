import React from 'react'
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Text, ListItem } from 'react-native-elements';
const ONLY_ME = 'Only Me'
const FRIENDS = 'Only Friends'
const EVERYONE = 'Everyone'

export default function PrivacySetting(props) {
  const [buttonPressed, setButtonPressed] = React.useState(ONLY_ME)
  return (
    <FlatList
      style={styles.container}
      data={props.route.params.settingsList}
      keyExtractor={(obj, idx) => obj.title}
      renderItem={({ item }) => (
        <ListItem
          key={item.title}
          title={item.title}
          subtitle={item.subtitle}
          // leftAvatar={{ source: { uri: item.avatar_url } }}
          bottomDivider
          rightElement={() => (
            <RadioButton
              value={item.title}
              status={buttonPressed === item.title ? 'checked' : 'unchecked'}
              onPress={() => setButtonPressed(item.title)}
            />
          )}
          onPress={() => {
            setButtonPressed(item.title)
            // props.navigation.navigate(item.title)
          }}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 22,
    backgroundColor: "#fff"
  },
  scrollContents: {

  },
})