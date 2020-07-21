// HOC wrapper that allows the component to refresh
// refreshFunction must return a promise
import React from 'react'
import { View, RefreshControl, SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import { Text } from 'react-native-elements'
export default function WithRefresh(props) {
  const [refreshing, setRefreshing] = React.useState(false);
  const { refreshFunction } = props;
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshFunction();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.scrollView}
      >
        {props.children}
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    // backgroundColor: 'pink',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
})