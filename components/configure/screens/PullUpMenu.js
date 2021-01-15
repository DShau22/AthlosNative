import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";

export default function PullUpMenu(props) {
  const { refRBSheet, onItemPress, childArray, selected } = props;
  return (
    <RBSheet
      ref={refRBSheet}
      closeOnDragDown={true}
      closeOnPressMask={false}
      customStyles={{
        wrapper: {
          backgroundColor: "rgba(0, 0, 0, .3)"
        },
        draggableIcon: {
          backgroundColor: "#000"
        },
        container: {
          borderRadius: 10,
        }
      }}
    >
      <ScrollView>
        {childArray.map(({label, value}, idx) => (
          <TouchableOpacity
            key={idx}
            style={{
              width: '100%',
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
              marginBottom: idx + 1 === childArray.length ? 35 : 0,
              backgroundColor: selected === value ? 'grey' : null
            }}
            onPress={() => {
              onItemPress(value);
              refRBSheet.current.close();
            }}
          >
            <Text style={{
              fontSize: 20
            }}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </RBSheet>
  )
}
