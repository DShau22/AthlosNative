import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Text, ListItem } from 'react-native-elements';
import COMMUNITY_CONSTANTS from '../CommunityConstants'
import { useTheme } from '@react-navigation/native';
const Discover = (props) => {
  const { colors } = useTheme()
  const [searchText, setSearchText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  console.log(props.users)
  const renderItem = ({ item }) => {
    if (props.users[0] === COMMUNITY_CONSTANTS.NO_SEARCH_RESULTS) {
      return (
        <ListItem 
          key='NO SEARCH RESULTS'
          title='Aw man :('
          subtitle='your search yielded no results'
        />
      )
    }
    return (
      <ListItem
        key={item._id}
        leftAvatar={{ source: { uri: item.profileURL } }}
        title={`${item.firstName} ${item.lastName}`}
        subtitle='some subtitle?'
        bottomDivider
        chevron
        onPress={() => props.onItemPress(item)}
      />
    )
  }
  return (
    <View>
      <SearchBar
        placeholder="Search athletes..."
        onChangeText={setSearchText}
        value={searchText}
        containerStyle={{backgroundColor: colors.background, borderTopColor: colors.background, borderBottomColor: colors.header}}
        inputContainerStyle={{backgroundColor: colors.background}}
        inputStyle={styles.searchInputStyle}
        leftIconContainerStyle={{}}
        round
        onSubmitEditing={() => {
          console.log("searched: ", searchText);
          props.search(searchText, setIsLoading);
        }}
      />
      <ActivityIndicator
        size='large'
        animating={isLoading}
      />
      <FlatList 
        data={props.users}
        renderItem={renderItem}
        keyExtractor={user => user._id}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
})

export default gestureHandlerRootHOC(Discover)