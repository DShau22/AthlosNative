import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist'
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG} from './DeviceConfigConstants'
import Icon from 'react-native-vector-icons/Entypo';
import Popup from './Popup'

const DeviceConfig = (props) => {
  const [deviceConfig, setDeviceConfig] = React.useState(DEFAULT_CONFIG);
  const [adding, setAdding] = React.useState(false);

  const renderItem = ({ item, index, drag, isActive }) => {
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
            onPress={() => console.log("butotn")}
          >
            <Icon
              name='rocket'
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
  };

  return (
    <View style={{ flex: 1 }}>
      <Popup
        adding={adding}
        setAdding={setAdding}
        setDeviceConfig={setDeviceConfig}
      />
      <DraggableFlatList
        data={deviceConfig}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.mode}-${index}`}
        onDragEnd={({ data }) => setDeviceConfig(data)}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAdding(true)}
      >
        <Icon name="plus" size={30} color='black' />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,

    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10
  }
})
export default gestureHandlerRootHOC(DeviceConfig)