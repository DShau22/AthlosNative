import React, { Component } from 'react'
import { Dimensions, View, ScrollView, StyleSheet } from "react-native";
import { Card } from 'react-native-elements';
import {
  BarChart,
} from "react-native-chart-kit";
import { useTheme } from '@react-navigation/native';
import { COLOR_THEMES } from '../../ColorThemes' 
import GLOBAL_CONSTANTS from '../../GlobalConstants';

interface WeeklyBarChartProps {
  labels: Array<any>,
  data: Array<any>,
  activity: string,
  yAxisUnits?: string,
  yAxisMin?: number,
}

const WeeklyBarChart = (props: WeeklyBarChartProps) => {
  const { labels, data, activity, yAxisUnits, yAxisMin } = props
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
  let chartConfig = {
    backgroundGradientFrom: colors.background,
    // backgroundGradientFrom: 'white',
    // backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.background,
    // backgroundGradientTo: 'white',
    // backgroundGradientToOpacity: 0.5,
    barPercentage: .80,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => getColorTheme(), // controls bar colors
    labelColor: (opacity = 1) => colors.textColor,
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
    <BarChart
      style={{alignSelf: 'center', paddingRight: 10}}
      data={chartData}
      width={.95 * GLOBAL_CONSTANTS.SCREEN_WIDTH}
      height={350}
      chartConfig={chartConfig}
      verticalLabelRotation={40}
      horizontalLabelRotation={0}
      fromZero
      yAxisLabel="laps"
      yAxisSuffix={yAxisUnits ? yAxisUnits : ''}
      withHorizontalLabels={!data.every((el) => el === 0)}
      // showBarTops={false}
      showValuesOnTopOfBars
    />
  )
}
const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'red',
    alignItems: 'center',
    // justifyContent: 'center',
    padding: 5,
  },
  graphStyle: {
    // backgroundColor: 'red',
    marginLeft: 5,
  },
})
export default WeeklyBarChart
