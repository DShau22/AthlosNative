import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont()

export default function ModeItem(props) {
  const { item, index, drag, isActive, deleteMode, displayEditModal } = props
  return (
    <TouchableOpacity
      style={{
        height: 100,
        backgroundColor: isActive ? "blue" : item.backgroundColor,
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 5,
      }}
      // on press, open up the edit dialog
      onPress={displayEditModal}
      onLongPress={drag}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
        </TouchableOpacity>
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
    right: 10
  }
})
