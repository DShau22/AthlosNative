import React from 'react'
import { View, TouchableOpacity, ScrollView, Button } from 'react-native';
import { Text } from 'react-native-elements';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { SCREEN_HEIGHT, SCREEN_WIDTH } = GLOBAL_CONSTANTS;
import RBSheet from "react-native-raw-bottom-sheet";
import Picker from '@gregfrench/react-native-wheel-picker'
var PickerItem = Picker.Item;

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
    childArrays.forEach(({title, width, array}, listIdx) => {
      res.push(array.indexOf(selectedItems[listIdx]));
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
                  childArrays[0].array[selectedIndexes[0]],
                  childArrays[1] ? childArrays[1].array[selectedIndexes[1]] : null,
                  childArrays[2] ? childArrays[2].array[selectedIndexes[2]] : null,
                );
                refRBSheet.current.close();
              }}
            />
          </View>
        </View>
        <View style={{flexDirection: 'row', height: '100%', justifyContent: 'center'}}>
          {childArrays.map(({title, width, array}, listIdx) => (
            <View style={{
              flexDirection: 'column',
              height: '100%',
              alignItems: 'center',
              marginBottom: 20
            }}>
              {/* <Text>{title}</Text> */}
              <Picker 
                style={{width: width, height: SCREEN_HEIGHT/4}}
                selectedValue={selectedIndexes[listIdx]}
                itemStyle={{color:"black", fontSize: 24}}
                itemSpace={30}
                onValueChange={(idx) => {
                  setSelectedIndexes(prev => {
                    const copy = [...prev];
                    copy[listIdx] = idx;
                    return copy;
                  });
                }}
              >
                {array.map((value, i) => (
                  <PickerItem label={`${value}`} value={i} key={`${value}-${i}`}/>
                ))}
              </Picker>
            </View>
          ))}
        </View>
      </View>
    </RBSheet>
  )
}
