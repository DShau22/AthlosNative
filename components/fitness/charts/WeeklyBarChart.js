import React, { Component } from 'react'
import { Dimensions, View, Text, StyleSheet } from "react-native";
import { Card } from 'react-native-elements';
import {
  BarChart,
} from "react-native-chart-kit";
import { useTheme } from '@react-navigation/native';
import { COLOR_THEMES } from '../../ColorThemes' 
const screenWidth = Dimensions.get("window").width;

const WeeklyBarChart = (props) => {
  const { labels, data, activity, yAxisUnits } = props
  const chartWidth = Math.max(.9 * screenWidth, data.length / 7 * screenWidth)
  const { colors } = useTheme();
  const getColorTheme = () => {
    switch(activity.toLowerCase()) {
      case 'runs':
        return COLOR_THEMES.RUN_THEME
      case 'jumps':
        return COLOR_THEMES.JUMP_THEME
      case 'swims':
        return COLOR_THEMES.SWIM_THEME
      default:
        return 'black'
    }
  }
  const chartData = {
    labels,
    datasets: [
      {
        data,
      }
    ]
  };
  chartConfig={
    // backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    // backgroundGradientFrom: 'white',
    // backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.background,
    // backgroundGradientTo: 'white',
    // backgroundGradientToOpacity: 0.5,
    barPercentage: .8,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => getColorTheme(), // controls bar colors
    labelColor: (opacity = 1) => colors.textColor,
    style: {
      borderRadius: 16,
    },
    fillShadowGradientOpacity: .6,
    // barRadius: 10,
    // propsForDots: {
    //   r: "6",
    //   strokeWidth: "2",
    //   stroke: "#ffa726"
    // },
    propsForBackgroundLines: {
      stroke: colors.textColor,
      opacity: .3,
      strokeWidth: '1',
    },
  };

  return (
    <View style={styles.cardContainer}>
      <BarChart
        style={styles.graphStyle}
        data={chartData}
        width={600}
        height={300}
        chartConfig={chartConfig}
        verticalLabelRotation={25}
        horizontalLabelRotation={0}
        fromZero
        yAxisSuffix={yAxisUnits ? yAxisUnits : ''}
        withHorizontalLabels={data.length > 0}
        // showBarTops={false}
        // showValuesOnTopOfBars
      />
    </View>
  )
}
const styles = StyleSheet.create({
  cardContainer: {
    // backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    padding: 5,
  },
  graphStyle: {
    // backgroundColor: 'red',
    marginLeft: 5,
  },
})
export default WeeklyBarChart
