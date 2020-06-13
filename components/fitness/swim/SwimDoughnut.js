import React from 'react'
import Doughnut from "react-chartjs-2"

export default function SwimDoughnut( props ) {
  return (
    <div>
      <Doughnut
        data={{
          datasets: [{
            data: props.data,
            backgroundColor: props.colors
          }],
          labels: props.labels
        }}
        options={{
          legend: {
            display: false,
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  )
}