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
 * selectedItems: the current values (not indexes) in the childArray that should be selected
 * noDividers (boolean): what it sounds like
 * pullUpTitle: the title displayed in between the cancel and done buttons
 * anything with second/third is for if you want to have two/three side by side scrollviews
 */

 interface MenuPromptProps {
  promptTitle?: string,
  promptSubtitle?: string,
  childArrays: Array<any>,
  onSave: Function,
  onLongPress?: Function,
  selectedItems: Array<any>,
  noDividers?: boolean,
  noChevron?: boolean,
  pullUpTitle?: string,
  fontSize?: number,
 }
const MenuPrompt: React.FC<MenuPromptProps> = (props) => {
  const { colors } = useTheme();
  const refRBSheet = React.useRef();
  const {
    promptTitle,
    promptSubtitle,
    childArrays,
    selectedItems,
    onSave,
    noDividers,
    noChevron,
    onLongPress,
    pullUpTitle,
    fontSize,
  } = props; 
  return (
    <>
      <ListItem
        containerStyle={[{width: '100%', backgroundColor: colors.background}]}
        bottomDivider={!noDividers}
        topDivider={!noDividers}
        onPress={() => refRBSheet.current.open()}
        onLongPress={onLongPress ? onLongPress : () => {}}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>{promptTitle}</ThemeText>
          </ListItem.Title>
          {promptSubtitle ? 
            <ListItem.Subtitle>
              <ThemeText>{promptSubtitle}</ThemeText>
            </ListItem.Subtitle>
          : null}
        </ListItem.Content>
        {noChevron ? null : <ListItem.Chevron/>}
      </ListItem>
      <PullUpMenu
        refRBSheet={refRBSheet}
        onSave={onSave}
        pullUpTitle={pullUpTitle}
        childArrays={childArrays}
        selectedItems={selectedItems}
        fontSize={fontSize}
      />
    </>
  )
}
export default MenuPrompt;