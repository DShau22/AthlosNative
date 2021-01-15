import { useTheme } from '@react-navigation/native';
import React from 'react'
import { Text, ListItem } from 'react-native-elements'
import ThemeText from '../../generic/ThemeText';

export default function PoolLengthList(props) {
  const { poolLength, setPoolLength, containerStyle, choices } = props;
  const { colors } = useTheme();
  return choices.map((lengthObject, _) => (
    <ListItem
      containerStyle={containerStyle}
      key={lengthObject.title}
      bottomDivider
      onPress={() => {
        setPoolLength(lengthObject.title);
      }}
    >
      <ListItem.Content>
        <ListItem.Title>
          <ThemeText>{lengthObject.title}</ThemeText>
        </ListItem.Title>
        <ListItem.Subtitle>
          <ThemeText>
            {lengthObject.subtitle}
          </ThemeText>
        </ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.CheckBox
        onPress={() => setPoolLength(lengthObject.title)}
        checked={poolLength === lengthObject.title}
        checkedColor={colors.textColor}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
      />
    </ListItem>
  ));
}
