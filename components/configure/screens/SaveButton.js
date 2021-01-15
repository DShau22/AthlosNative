import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import ThemeText from '../../generic/ThemeText';

export default function SaveButton({onPress, containerStyle}) {
  const { colors } = useTheme();
  return (
    <View style={containerStyle}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: colors.backgroundOffset,
          width: 100,
          height: 50,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: colors.header,
          borderWidth: 1
        }}
      >
        <ThemeText
          style={{
            fontSize: 24,
          }}
        >
          Save
        </ThemeText>
      </TouchableOpacity>
    </View>
  );
}
