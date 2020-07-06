import React from 'react'
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Text, ListItem } from 'react-native-elements';
import GLOBAL_CONSTANTS from '../../GlobalConstants'
const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

export default function PrivacySetting(props) {
  let { defaultOption, settingsList, updateSettings } = props;
  let initialChoice = defaultOption;
  // this is just in case the backend names don't line up with the frontend
  if (defaultOption !== ONLY_ME && defaultOption !== FOLLOWERS && defaultOption !== EVERYONE) initialChoice = ONLY_ME;

  const [buttonPressed, setButtonPressed] = React.useState(initialChoice);
  return (
    <FlatList
      style={styles.container}
      data={props.settingsList}
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
              onPress={() => {
                setButtonPressed(item.title);
                props.updateSettings(item.title);
              }}
            />
          )}
          onPress={() => {
            setButtonPressed(item.title);
            props.updateSettings(item.title);
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