import React from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import { DEVICE_CONFIG_CONSTANTS } from '../DeviceConfigConstants';
const { MUSIC_ONLY, MODE_CONFIG, RANDOM_MUSIC_SEQUENCE, ORDER_BY_DATE } = DEVICE_CONFIG_CONSTANTS;
import ThemeText from '../../generic/ThemeText';

const MusicOnlyScreen: React.FC<any> = (props) => {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [musicPlaySequence, setMusicPlaySequence] = React.useState<string>();
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your running settings', [{text: 'Okay'}]);
    navigation.navigate(MODE_CONFIG);
  }, [deviceConfig]);

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused
        resetState();
      };
    }, [])
  );

  const saveEdits = () => {
    // depending on the edit mode
    setIsLoading(true);
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: MUSIC_ONLY,
        musicPlaySequence,
      };
      prevConfig[editIdx] = newModeSettings
      return [...prevConfig]
    });
  }

  const resetState = () => {
    setMusicPlaySequence(deviceConfig[editIdx].musicPlaySequence);
    firstUpdate.current = true;
  }

  return (
    <ScrollView style={{
      flex: 1,
      padding: 20,
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    }}>
      <Spinner
        visible={isLoading}
        textContent='Saving...'
        textStyle={{color: colors.text}}
      />
      <ThemeText style={{fontWeight: 'bold', fontSize: 24}}>
        Music Mode
      </ThemeText>
      <ThemeText style={{marginTop: 10}}>
        This is the default mode that your Athlos earbuds will start with after powering on. Your earbuds will
        work just like any other bluetooth earbuds when connected to a mobile device, or will play the music 
        downloaded onto the earbuds if not connected.
      </ThemeText>
      <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
        Music Settings
      </ThemeText>
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        key={'music-play-sequence-random'}
        bottomDivider
        topDivider
        onPress={() => setMusicPlaySequence(RANDOM_MUSIC_SEQUENCE)}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>Random</ThemeText>
          </ListItem.Title>
          <ListItem.Subtitle>
            <ThemeText>
              Your music will be randomly shuffled on every power up.
            </ThemeText>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={musicPlaySequence === RANDOM_MUSIC_SEQUENCE}
          checkedColor={colors.text}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          onPress={() => setMusicPlaySequence(RANDOM_MUSIC_SEQUENCE)}
        />
      </ListItem>
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        key={'music-play-sequence-order'}
        bottomDivider
        topDivider
        onPress={() => setMusicPlaySequence(ORDER_BY_DATE)}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>Order by date</ThemeText>
          </ListItem.Title>
          <ListItem.Subtitle>
            <ThemeText>
              Your music will be played ordered by when songs were 
            </ThemeText>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={musicPlaySequence === ORDER_BY_DATE}
          checkedColor={colors.text}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          onPress={() => setMusicPlaySequence(ORDER_BY_DATE)}
        />
      </ListItem>
    </ScrollView>
  )
}

export default MusicOnlyScreen;