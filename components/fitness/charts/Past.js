import React, { Component } from 'react'
import { Dimensions, View, Text, StyleSheet } from "react-native";
import { Card } from 'react-native-elements';
import {
  BarChart,
} from "react-native-chart-kit";
import { useTheme } from '@react-navigation/native';
import { COLOR_THEMES } from '../../ColorThemes' 
const screenWidth = Dimensions.get("window").width;

const Past = (props) => {
  const { labels, data, hoverLabel, yAxisMin, yAxisMax, chartTitle, activity } = props
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
  const graphStyle = {
    // backgroundColor: 'red',
    marginLeft: 20
  };
  return (
    <BarChart
      style={graphStyle}
      data={chartData}
      width={chartWidth}
      height={300}
      chartConfig={chartConfig}
      verticalLabelRotation={25}
      fromZero
      // showBarTops={false}
      // showValuesOnTopOfBars
    />
  )
}
const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    padding: 20,
  }
})
export default Past
