import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements'
import { useTheme } from '@react-navigation/native';
import ThemeText from '../generic/ThemeText';

interface DisableEncouragementsProps {
  title?: string,
  subtitle?: string,
  setDisableEncouragements: Function,
  disableEncouragements: boolean,
};

const DisableEncouragements: React.FC<DisableEncouragementsProps> = ({title, subtitle, setDisableEncouragements, disableEncouragements}) => {
  const { colors } = useTheme();
  if (!title) {
    title = 'Disable Encouragements?';
  }
  if (!subtitle) {
    subtitle = 'When checked, the Athlos coach will not give any tailored encouragements and motivation for this activity, but will still give you live results and reports.';
  }
  return (
    <ListItem
      containerStyle={{backgroundColor: colors.background}}
      key={`disable-encouragement`}
      topDivider
      bottomDivider
      onPress={() => setDisableEncouragements(!disableEncouragements)}
    >
      <ListItem.Content>
        <ListItem.Title>
          <ThemeText>{title}</ThemeText>
        </ListItem.Title>
        <ListItem.Subtitle>
          <ThemeText>
            {subtitle}
          </ThemeText>
        </ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.CheckBox
        checked={disableEncouragements}
        checkedColor={colors.textColor}
        onPress={() => setDisableEncouragements(!disableEncouragements)}
      />
    </ListItem>
  )
}

export default DisableEncouragements;