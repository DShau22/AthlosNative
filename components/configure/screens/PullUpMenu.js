import React from 'react'
import { View, TouchableOpacity, ScrollView, Button } from 'react-native';
import { Text } from 'react-native-elements';
import RBSheet from "react-native-raw-bottom-sheet";
import ScrollPicker from "react-native-wheel-scrollview-picker";

export default function PullUpMenu(props) {
  const {
    refRBSheet,
    pullUpTitle,
    childArrays,
    selectedItems,
    onSave,
  } = props;
  // need this so that the scroll wheel updates in addition to the prompt title
  React.useEffect(() => {
    setSelectedIndexes(getSelectedIndexes());
  }, [childArrays]);

  const getSelectedIndexes = () => {
    const res = [];
    childArrays.forEach((list, listIdx) => {
      res.push(list.indexOf(selectedItems[listIdx]));
    });
    return res;
  }

  const [selectedIndexes, setSelectedIndexes] = React.useState(getSelectedIndexes());
      
  const resetState = () => {
    setSelectedIndexes(getSelectedIndexes());
  }

  return (
    <RBSheet
      ref={refRBSheet}
      // closeOnDragDown={true}
      // closeOnPressBack={true}
      // closeOnPressMask={true}
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
      <View style={{flexDirection: 'column'}}>
        <View style={{height: 50, flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
          <View style={{marginLeft: 10}}>
            <Button
              title='Cancel'
              onPress={() => {
                refRBSheet.current.close()
                resetState();
              }}
            />
          </View>
          <View>
            <Text style={{fontSize: 20}}>{pullUpTitle}</Text>
          </View>
          <View style={{marginRight: 10}}>
            <Button
              title='Done'
              onPress={() => {
                onSave(
                  childArrays[0][selectedIndexes[0]],
                  childArrays[1] ? childArrays[1][selectedIndexes[1]] : null,
                  childArrays[2] ? childArrays[2][selectedIndexes[2]] : null,
                );
                refRBSheet.current.close();
              }}
            />
          </View>
        </View>
        <View style={{flexDirection: 'row', }}>
          {childArrays.map((list, listIdx) => (
            <ScrollPicker
              dataSource={list}
              selectedIndex={selectedIndexes[listIdx]}
              renderItem={(data, index) => {
                //
              }}
              onValueChange={(data, idx) => {
                setSelectedIndexes(prev => {
                  const copy = [...prev];
                  copy[listIdx] = idx;
                  return copy;
                });
              }}
              wrapperHeight={180}
              wrapperWidth={150}
              wrapperBackground={"#FFFFFF"}
              itemHeight={60}
              highlightColor={"#d8d8d8"}
              highlightBorderWidth={2}
            />
          ))}
        </View>
      </View>
    </RBSheet>
  )
}
