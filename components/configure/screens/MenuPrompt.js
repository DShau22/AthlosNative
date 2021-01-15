import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import ThemeText from '../../generic/ThemeText';
import PullUpMenu from './PullUpMenu';

export default function MenuPrompt(props) {
  const { colors } = useTheme();
  const refRBSheet = React.useRef();
  const {
    title,
    childArray,
    onItemPress,
    selectedItem,
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
            <ThemeText>{title}</ThemeText>
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron name='chevron-forward'/>
      </ListItem>
      <PullUpMenu
        refRBSheet={refRBSheet}
        onItemPress={onItemPress}
        childArray={childArray}
        selected={selectedItem}
      />
    </>
  )
}
