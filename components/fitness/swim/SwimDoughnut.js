import React from 'react'
import { PieChart } from 'react-native-svg-charts'
import { View, Text } from 'react-native'
const SwimDoughnut = ( props ) => {

  const randomColor = () => ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(0, 7)
  const { data, labels } = props;
  const pieData = labels
    .map((stroke, idx) => ({
      key: stroke,
      value: data[idx],
      svg: {
          fill: randomColor(),
          onPress: () => console.log('press', index),
      },
    }))
  // if the user hasn't swum at all, then just have a grey doughnut
  // with a message saying they needa swim
  if (data.every(strokeLaps => strokeLaps === 0)) {
    const noData = [{
      key: "No laps swum :(",
      value: 1,
      svg: {
        fill: '#e5e5e5'
      }
    }]
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center'}}>
        <Text>Looks like you haven't swam this day</Text>
        <PieChart style={{ height: 100, width: 100 }} data={noData} />
      </View>
    )
  }
  return (
    <PieChart style={{ height: 100, width: 100 }} data={pieData} />
  )
}
export default SwimDoughnut