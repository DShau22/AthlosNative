import React from 'react';
import { View } from 'react-native';
import ThemeText from '../../generic/ThemeText';

export default function MusicOnlyScreen() {
  return (
    <View style={{flex: 1, padding: 20}}>
      <ThemeText style={{fontWeight: 'bold', fontSize: 24}}>
        Music Mode
      </ThemeText>
      <ThemeText style={{marginTop: 10}}>
        This is the default mode that your Athlos earbuds will start with after powering on. Your earbuds will
        work just like any other bluetooth earbuds when connected to a mobile device, or will play the music 
        downloaded onto the earbuds if not connected.
      </ThemeText>
    </View>
  )
}
