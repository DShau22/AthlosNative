import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist'
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-elements'

const exampleData = [...Array(20)].map((d, index) => ({
  key: `item-${index}`, // For example only -- don't use index as your key!
  label: index,
  backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index *
    5}, ${132})`
}));

const DeviceConfig = (props) => {
  const [data, setData] = React.useState(exampleData);

  const renderItem = ({ item, index, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={{
          height: 100,
          backgroundColor: isActive ? "blue" : item.backgroundColor,
          alignItems: "center",
          justifyContent: "center"
        }}
        onLongPress={drag}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: 32
          }}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        onDragEnd={({ data }) => setData(data)}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  
})
export default gestureHandlerRootHOC(DeviceConfig)