import React from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { UserDataContext, ProfileContext } from '../../../Context';
import { Divider } from 'react-native-paper';
import { inchesToCm, poundsToKg, englishHeight } from '../../utils/unitConverter'
import PROFILE_CONSTANTS from '../ProfileConstants'
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import ViewMoreText from 'react-native-view-more-text';
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
  const profileContext  = React.useContext(ProfileContext);
  const userDataContext = React.useContext(UserDataContext);
  const { unitSystem } = userDataContext.settings;
  const { bio, age, weight, height, gender, username, firstName, lastName } = profileContext;
  const { profileURL } = profileContext.profilePicture;

  const displayHeight = unitSystem === METRIC ? `${inchesToCm(height)} cm` : englishHeight(height);
  const displayWeight = unitSystem === METRIC ? `${poundsToKg(weight)} kg` : `${weight} lbs`;
  const infoList = [
    { title: USERNAME, value: username },
    { title: GENDER, value: gender },
    { title: AGE, value: age },
    { title: HEIGHT, value: displayHeight },
    { title: WEIGHT, value: displayWeight },
  ]
  const renderViewMore = (onPress) => (
    <Text onPress={onPress}>View more</Text>
  )

  const renderViewLess = (onPress) => (
    <Text onPress={onPress}>View less</Text>
  )
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          style={styles.profilePic}
          source={{uri: profileURL}}
        />
        <Text h3>{`${firstName} ${lastName}`}</Text>
        <View style={styles.bioContainer}>
          <ViewMoreText
            numberOfLines={3}
            renderViewMore={renderViewMore}
            renderViewLess={renderViewLess}
            textStyle={{textAlign: 'center'}}
          >
            <Text>{bio}</Text>
          </ViewMoreText>
        </View>
      </View>
      <FlatList 
        data={infoList}
        keyExtractor={item => item.title}
        renderItem={({ item, index }) => (
          <View>
            {index === 0 ? <Divider /> : null}
            <View style={[styles.listItemStyle, styles.row]}>
              <Text h4 style={{position: 'absolute', left: 0}}>{item.title}</Text>
              <Text h4 style={{marginLeft: 50}}>{item.value}</Text>
            </View>
            <Divider />
          </View>
        )}
      />
    </View>
  )
}

export default ProfileInfo;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {

  },
  bioContainer: {

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profilePic: {
    height: 80,
    width: 80,
    borderRadius: 40

  },
  listItemStyle: {

  }
})
