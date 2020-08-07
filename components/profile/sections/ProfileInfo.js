import React from 'react';
import { View, Image, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { Divider } from 'react-native-paper';
import { inchesToCm, poundsToKg, englishHeight } from '../../utils/unitConverter'
import ViewMoreText from 'react-native-view-more-text';
import { useTheme } from '@react-navigation/native';

import { UserDataContext, ProfileContext } from '../../../Context';
import PROFILE_CONSTANTS from '../ProfileConstants'
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import ThemeText from '../../generic/ThemeText'
import StatCard from '../../fitness/StatCard'
import { capitalize } from '../../utils/strings'
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS
const { 
  BIO,
  AGE,
  WEIGHT,
  HEIGHT,
  GENDER,
  USERNAME,
} = PROFILE_CONSTANTS

const ProfileInfo = (props) => {
  const { colors } = useTheme();
  const profileContext  = React.useContext(ProfileContext);
  const userDataContext = React.useContext(UserDataContext);
  const { unitSystem } = userDataContext.settings;
  const { bio, age, weight, height, gender, username, firstName, lastName } = profileContext;
  const { profileURL } = profileContext.profilePicture;

  const displayHeight = unitSystem === METRIC ? `${inchesToCm(height)} cm` : englishHeight(height);
  const displayWeight = unitSystem === METRIC ? `${poundsToKg(weight)} kg` : `${weight} lbs`;
  const infoList = [
    { title: USERNAME, value: capitalize(username) },
    { title: GENDER,   value: capitalize(gender) },
    { title: AGE,      value: age },
    { title: HEIGHT,   value: displayHeight },
    { title: WEIGHT,   value: displayWeight },
  ]
  const renderViewMore = (onPress) => (
    <Text onPress={onPress}>View more</Text>
  )

  const renderViewLess = (onPress) => (
    <Text onPress={onPress}>View less</Text>
  )
  return (
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center'}}>
      <View style={styles.header}>
        <Image 
          style={styles.profilePic}
          source={{uri: profileURL}}
        />
        <Text h3>{`${firstName} ${lastName}`}</Text>
        <View style={styles.bioContainer}>
          <ThemeText h4>Bio</ThemeText>
          <ViewMoreText
            numberOfLines={3}
            renderViewMore={renderViewMore}
            renderViewLess={renderViewLess}
            textStyle={{margin: 5, color: colors.textColor}}
          >
            <Text>{bio}</Text>
          </ViewMoreText>
        </View>
      </View>
      {infoList.map((info, idx) => (
        <StatCard
          key={idx}
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label={info.value}
          stat={info.title}
          labelProps={{h4: true}}
        />
      ))}
    </ScrollView>
  )
}

export default ProfileInfo;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center'
  },
  header: {
    marginTop: 25,
    alignItems: 'center',
    width: '100%',
  },
  bioContainer: {
    width: '90%',
    borderRadius: 5,
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFBFBF'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profilePic: {
    height: 140,
    width: 140,
    borderRadius: 140,
    marginBottom: 20,
  },
  listItemStyle: {

  }
})
