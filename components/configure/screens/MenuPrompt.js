import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import ThemeText from '../../generic/ThemeText';
import PullUpMenu from './PullUpMenu';

/**
 * promptTitle: what gets shown on the listitem display
 * childArray: list elements in the pullup menu scrollview
 * onSave: Function that takes in a value that runs after user presses done
 * selectedItem: the current value in the childArray that should be selected
 * anything with second/third is for if you want to have two/three side by side scrollviews
 */

export default function MenuPrompt(props) {
  const { colors } = useTheme();
  const refRBSheet = React.useRef();
  const {
    promptTitle,
    promptSubtitle,
    childArray,
    secondChildArray,
    thirdChildArray,
    onItemPress,
    onSave,
    selectedItem,
    secondSelectedItem,
    thirdSelectedItem,
  } = props; 
  return (
    <>
      <ListItem
        containerStyle={[{backgroundColor: colors.background}]}
        bottomDivider
        topDivider
        onPress={() => refRBSheet.current.open()}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>{promptTitle}</ThemeText>
          </ListItem.Title>
          <ListItem.Subtitle>
            <ThemeText>{promptSubtitle}</ThemeText>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron name='chevron-forward'/>
      </ListItem>
      <PullUpMenu
        refRBSheet={refRBSheet}
        onSave={onSave}
        onItemPress={onItemPress}
        childArray={childArray}
        selected={selectedItem}
        secondSelected={secondSelectedItem}
        secondChildArray={secondChildArray}
        thirdChildArray={thirdChildArray}
        thirdSelected={thirdSelectedItem}
      />
    </>
  )
}
