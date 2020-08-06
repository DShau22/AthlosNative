import React from 'react'
import { PieChart } from 'react-native-svg-charts'
import { View } from 'react-native'
import { Text } from 'react-native-svg'
const SwimDoughnut = ( props ) => {
  const { data, labelToShow, colors } = props;
  const [slicePressed, setSlicePressed] = React.useState(null);
  const indexToActivity = {0: 'Fly', 1: 'Back', 2: 'Breast', 3: 'Free'}
  const pieData = data.map((value, index) => ({
    value,
    svg: {
      fill: colors[index],
      onPress: () => setSlicePressed(index === slicePressed ? null : index),
    },
    key: `pie-${index}-${value}`,
    arc: { outerRadius: index === slicePressed ? '90%' : '80%', cornerRadius: 0 }
  }))
  const Labels = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
      const { labelCentroid, pieCentroid, data } = slice;
      return (
        <Text
          key={index}
          x={pieCentroid[ 0 ]}
          y={pieCentroid[ 1 ]}
          fill={'black'}
          textAnchor={'middle'}
          alignmentBaseline={'middle'}
          fontSize={24}
          stroke={'black'}
          strokeWidth={0.2}
        >
          {index === slicePressed ? `${data.value}% ${indexToActivity[index]}` : ''}
        </Text>
      )
    })
  }
  // if the user hasn't swum at all, then just have a grey doughnut
  // with a message saying they needa swim
  if (data.length === 0) {
    const noData = [{
      key: "No laps swum :(",
      value: 1,
      svg: {
        fill: '#e5e5e5'
      }
    }]
    return (
      <>
        <View style={{alignItems: 'center', marginTop: 20, marginBottom: 20}}>
          <ThemeText>Looks like you didn't run this day</ThemeText>
        </View>
        <PieChart
          style={props.style}
          data={noData}
          spacing={0}
          innerRadius='35%'
          outerRadius='80%'
        />
      </>
    )
  }
  return (
    <PieChart
      style={[props.style]}
      valueAccessor={({item}) => item.value}
      data={pieData}
      spacing={0}
      innerRadius='35%'
    >
      <Labels />
    </PieChart>
  )
}
export default SwimDoughnut