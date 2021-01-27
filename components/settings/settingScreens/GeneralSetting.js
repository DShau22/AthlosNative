import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Text, ListItem } from 'react-native-elements';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';
import { capitalize } from '../../utils/strings';

const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

const GeneralSetting = (props) => {
  const { colors } = useTheme();
  const { initialChoice, saveSettings, settingsList, updateSettings } = props;
  console.log(initialChoice);

  const [buttonPressed, setButtonPressed] = React.useState(initialChoice.toLowerCase());
  return (
    <FlatList
      style={styles.container}
      data={settingsList}
      keyExtractor={(obj, idx) => obj.title}
      renderItem={({ item }) => (
        <ListItem
          containerStyle={{backgroundColor: colors.background}}
          key={item.title}
          bottomDivider
          onPress={() => {
            setButtonPressed(item.title.toLowerCase());
            updateSettings(item.title.toLowerCase());
          }}
        >
          <ListItem.Content>
            <ListItem.Title>
              <ThemeText>{capitalize(item.title)}</ThemeText>
            </ListItem.Title>
            <ListItem.Subtitle>
              <ThemeText>
                {item.subtitle}
              </ThemeText>
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.CheckBox
            onPress={() => {
              setButtonPressed(item.title.toLowerCase());
              updateSettings(item.title.toLowerCase());
            }}
            checked={buttonPressed === item.title.toLowerCase()}
            checkedColor={colors.textColor}
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
          />
        </ListItem>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
      ListFooterComponent={() => (
        <TouchableOpacity
          style={[styles.saveButton, {backgroundColor: colors.button}]}
          onPress={saveSettings}
        >
          <ThemeText>Save Settings</ThemeText>
        </TouchableOpacity>
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
  saveButton: {
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 50,
  }
})
export default gestureHandlerRootHOC(GeneralSetting)