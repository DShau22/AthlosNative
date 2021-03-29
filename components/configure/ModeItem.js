import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont();
import { DEVICE_CONFIG_CONSTANTS } from './DeviceConfigConstants';
import { COLOR_THEMES } from '../ColorThemes';
import { useTheme } from '@react-navigation/native';
const { RUN_THEME, SWIM_THEME, JUMP_THEME, SWIMMING_EVENT_THEME, INTERVAL_THEME, TIMER_THEME, SWIM_WORKOUT_THEME } = COLOR_THEMES;
const { MUSIC_ONLY, RUN, SWIM, JUMP, SWIMMING_EVENT, INTERVAL, TIMER, SWIM_WORKOUT } = DEVICE_CONFIG_CONSTANTS;

export default function ModeItem(props) {
  const { colors } = useTheme();
  const { item, index, drag, isActive, deleteMode, onPress } = props;
  const modeToColor = (mode) => { // use a function instead of object to save memory
    switch(mode) {
      case MUSIC_ONLY:
        return colors.textColor;
      case RUN:
        return RUN_THEME;
      case SWIM:
        return SWIM_THEME;
      case JUMP:
        return JUMP_THEME;
      case SWIMMING_EVENT:
        return SWIMMING_EVENT_THEME;
      case TIMER:
        return TIMER_THEME;
      case INTERVAL:
        return INTERVAL_THEME;
      case SWIM_WORKOUT:
        return SWIM_WORKOUT_THEME;
      default:
        return colors.header;
    }
  }
  return (
    <TouchableOpacity
      style={{
        height: 80,
        backgroundColor: isActive ? colors.backgroundOffset : colors.header,
        borderColor: item.mode === MUSIC_ONLY ? colors.textColor : colors.backgroundOffset,
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
        <View style={{
          backgroundColor: modeToColor(item.mode),
          position: 'absolute',
          left: -1,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          borderColor: item.mode === MUSIC_ONLY ? colors.textColor : colors.backgroundOffset,
          borderWidth: 1,
          width: '6%',
          height: '100%',
        }}></View>
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
