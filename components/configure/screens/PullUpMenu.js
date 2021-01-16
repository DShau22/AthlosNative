import React from 'react'
import { View, TouchableOpacity, ScrollView, Button } from 'react-native';
import { Text } from 'react-native-elements';
import RBSheet from "react-native-raw-bottom-sheet";
import ScrollPicker from "react-native-wheel-scrollview-picker";

export default function PullUpMenu(props) {
  const {
    refRBSheet,
    pullUpTitle,
    childArray,
    secondChildArray,
    thirdChildArray,
    selected,
    secondSelected,
    thirdSelected,
    onSave,
  } = props;
  const [selectedIdx, setSelectedIdx] = React.useState(childArray.indexOf(selected));
  const [secondSelectedIdx, setSecondSelectedIdx] = React.useState(
    secondChildArray ? secondChildArray.indexOf(secondSelected) : 0);
  const [thirdSelectedIdx, setThirdSelectedIdx] = React.useState(
    thirdChildArray ? thirdChildArray.indexOf(thirdSelected) : 0);
      
  const resetState = () => {
    setSelectedIdx(childArray.indexOf(selected));
    if (secondChildArray) {
      setSecondSelectedIdx(secondChildArray.indexOf(secondSelected));
    }
    if (thirdChildArray) {
      setThirdSelectedIdx(thirdChildArray.indexOf(thirdSelected))
    }
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
                  childArray[selectedIdx],
                  secondChildArray[secondSelectedIdx],
                  thirdChildArray[thirdSelectedIdx]
                );
                refRBSheet.current.close();
              }}
            />
          </View>
        </View>
        <View style={{flexDirection: 'row', }}>
          <ScrollPicker
            dataSource={childArray}
            selectedIndex={selectedIdx}
            renderItem={(data, index) => {
              //
            }}
            onValueChange={(data, idx) => {
              setSelectedIdx(idx);
            }}
            wrapperHeight={180}
            wrapperWidth={150}
            wrapperBackground={"#FFFFFF"}
            itemHeight={60}
            highlightColor={"#d8d8d8"}
            highlightBorderWidth={2}
          />
          {secondChildArray ? 
            <ScrollPicker
              dataSource={secondChildArray}
              selectedIndex={secondSelectedIdx}
              renderItem={(data, index) => {
                //
              }}
              onValueChange={(data, idx) => {
                setSecondSelectedIdx(idx);
              }}
              wrapperHeight={180}
              wrapperWidth={150}
              wrapperBackground={"#FFFFFF"}
              itemHeight={60}
              highlightColor={"#d8d8d8"}
              highlightBorderWidth={2}
            />
          : null}
          {thirdChildArray ? 
            <ScrollPicker
              dataSource={thirdChildArray}
              selectedIndex={thirdSelectedIdx}
              renderItem={(data, index) => {
                
              }}
              onValueChange={(data, idx) => {
                setThirdSelectedIdx(idx);
              }}
              itemTextStyle={{
                fontSize: 28
              }}
              wrapperHeight={180}
              wrapperWidth={150}
              wrapperBackground={"#FFFFFF"}
              itemHeight={60}
              highlightColor={"#d8d8d8"}
              highlightBorderWidth={2}
            />
          : null}
        </View>
      </View>
    </RBSheet>
  )
}
