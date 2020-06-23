import React, { Component } from 'react'
import { Dimensions, View, Text, StyleSheet } from "react-native";
import {
  LineChart,
  BarChart,
} from "react-native-chart-kit";
const screenWidth = Dimensions.get("window").width;

const Past = (props) => {
  const { labels, data, hoverLabel, yAxisMin, yAxisMax, chartTitle } = props
  const chartData = {
    labels,
    datasets: [
      {
        data,
      }
    ]
  };
  chartConfig={
    backgroundColor: "#e26a00",
    backgroundGradientFrom: "#fb8c00",
    backgroundGradientTo: "#ffa726",
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726"
    }
  };
  const graphStyle = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };
  return (
    <BarChart
      style={graphStyle}
      data={chartData}
      width={screenWidth}
      height={300}
      yAxisLabel="$"
      chartConfig={chartConfig}
      verticalLabelRotation={25}
      fromZero
    />
  )
  // const chartData = {
  //   labels,
  //   datasets: [
  //     {
  //       data,
  //       color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
  //       strokeWidth: 2 // optional
  //     }
  //   ],
  // };

  // return (
  //   <LineChart
  //     data={chartData}
  //     width={screenWidth}
  //     height={220}
  //     chartConfig={chartConfig}
  //   />
  // )
}

export default Past
