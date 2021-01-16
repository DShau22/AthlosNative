import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Button } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";

export default function PullUpMenu(props) {
  const {
    refRBSheet,
    onItemPress,
    childArray,
    secondChildArray,
    thirdChildArray,
    selected,
    secondSelected,
    thirdSelected,
    onSave,
  } = props;
  console.log('selected: ', selected);
  console.log('child: ', childArray);
  console.log('2 child: ', secondChildArray);
  console.log('3 child: ', thirdChildArray);
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
      closeOnPressBack={true}
      closeOnPressMask={true}
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
      onClose={() => resetState()}
    >
      <View style={{flexDirection: 'column'}}>
        <View style={{height: 50, flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
          <View style={{marginLeft: 10, marginTop: 10}}>
            <Button
              title='Cancel'
              onPress={() => refRBSheet.current.close()}
            />
          </View>
          <View style={{marginRight: 10}}>
            <Button
              title='Done'
              onPress={() => onSave(childArray[selectedIdx])}
            />
          </View>
        </View>
        <View style={{flexDirection: 'row', }}>
          <ScrollView style={{flex: 1}}>
            {childArray.map((value, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  width: '100%',
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                  marginBottom: idx + 1 === childArray.length ? 35 : 0,
                  backgroundColor: selectedIdx === idx ? 'grey' : null
                }}
                onPress={() => {
                  setSelectedIdx(idx);
                  // onItemPress(value);
                  // if (!secondChildArray) {
                  //   refRBSheet.current.close();
                  // }
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
          {secondChildArray ? 
            <ScrollView style={{flex: 1}}>
              {secondChildArray.map((value, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{
                    width: '100%',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                    marginBottom: idx + 1 === secondChildArray.length ? 35 : 0,
                    backgroundColor: secondSelectedIdx === value ? 'grey' : null
                  }}
                  onPress={() => {
                    setSecondSelectedIdx(idx);
                    // refRBSheet.current.close();
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
          : null}
          {thirdChildArray ? 
            <ScrollView style={{flex: 1}}>
              {thirdChildArray.map((value, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{
                    width: '100%',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                    marginBottom: idx + 1 === thirdChildArray.length ? 35 : 0,
                    backgroundColor: thirdSelectedIdx === value ? 'grey' : null
                  }}
                  onPress={() => {
                    setThirdSelectedIdx(idx);
                    // refRBSheet.current.close();
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
          : null}
        </View>
      </View>
    </RBSheet>
  )
}
