import { useTheme } from '@react-navigation/native';
import React from 'react'
import { Text, ListItem } from 'react-native-elements'

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
          <Text>{lengthObject.title}</Text>
        </ListItem.Title>
        <ListItem.Subtitle>
          <Text>
            {lengthObject.subtitle}
          </Text>
        </ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.CheckBox
        onPress={() => setPoolLength(lengthObject.title)}
        checked={poolLength === lengthObject.title}
        checkedColor={colors.background}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
      />
    </ListItem>
  ));
}
