import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont();
import { DEVICE_CONFIG_CONSTANTS } from './DeviceConfigConstants';
import { COLOR_THEMES } from '../ColorThemes';
import { useTheme } from '@react-navigation/native';
// const { RUN_THEME, SWIM_THEME, JUMP_THEME } = COLOR_THEMES;
const { MUSIC_ONLY, RUN, SWIM, JUMP, SWIMMING_EVENT, TIMED_RUN } = DEVICE_CONFIG_CONSTANTS;

export default function ModeItem(props) {
  const { colors } = useTheme();
  const { item, index, drag, isActive, deleteMode, onPress } = props;
  const modeToColor = (mode) => { // use a function instead of object to save memory
    switch(mode) {
      case MUSIC_ONLY:
        return colors.header;
      case RUN:
        return colors.header;
      case SWIM:
        return colors.header;
      case JUMP:
        return colors.header;
      case SWIMMING_EVENT:
        return colors.header;
      case TIMED_RUN:
        return colors.header;
      default:
        return colors.header;
    }
  }
  return (
    <TouchableOpacity
      style={{
        height: 80,
        backgroundColor: isActive ? colors.backgroundOffset : modeToColor(item.mode),
        borderColor: item.mode === MUSIC_ONLY ? 'white' : colors.backgroundOffset,
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15,
      }}
      // on press, open up the edit dialog
      // onPress={displayEditModal}
      onPress={onPress}
      onLongPress={drag}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.mode !== MUSIC_ONLY ?
          <TouchableOpacity
            style={styles.removeButton}
            // brings up the popup to confirm mode deletion
            onPress={() => deleteMode(index, item.mode)}
          >
            <Icon
              name='cross'
              size={30}
              color="white"
            />
          </TouchableOpacity> : null
        }
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: 32
          }}
        >
          {item.mode}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  }
})
