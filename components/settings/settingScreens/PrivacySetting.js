import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Text, ListItem } from 'react-native-elements';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
import { useTheme } from '@react-navigation/native';

const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

const PrivacySetting = (props) => {
  const { colors } = useTheme();
  const { defaultOption, settingsList, updateSettings } = props;
  var initialChoice = defaultOption;
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
          bottomDivider
          // rightElement={() => (
          //   <RadioButton
          //     value={item.title}
          //     status={buttonPressed === item.title ? 'checked' : 'unchecked'}
          //     onPress={() => {
          //       setButtonPressed(item.title);
          //       props.updateSettings(item.title);
          //     }}
          //   />
          // )}
          onPress={() => {
            setButtonPressed(item.title);
            props.updateSettings(item.title);
          }}
        >
          <ListItem.Content>
            <ListItem.Title>{item.title}</ListItem.Title>
            <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.CheckBox
            checked={buttonPressed === item.title}
            checkedColor={colors.textColor}
          />
        </ListItem>
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
export default gestureHandlerRootHOC(PrivacySetting)