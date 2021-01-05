import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Text, ListItem } from 'react-native-elements';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';

const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

const GeneralSetting = (props) => {
  const { colors } = useTheme();
  const { initialChoice, choices, settingsList, updateSettings } = props;
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
            props.updateSettings(item.title.toLowerCase());
          }}
        >
          <ListItem.Content>
            <ListItem.Title>
              <ThemeText>{item.title}</ThemeText>
            </ListItem.Title>
            <ListItem.Subtitle>
              <ThemeText>
                {item.subtitle}
              </ThemeText>
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.CheckBox
            checked={buttonPressed === item.title.toLowerCase()}
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
export default gestureHandlerRootHOC(GeneralSetting)