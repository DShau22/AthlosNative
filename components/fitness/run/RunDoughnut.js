import React from 'react'
import Doughnut from "react-chartjs-2"
export default function RunDoughnut( props ) {
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
          plugins: {
            zoom: false,
          },
          legend: {
            display: true,
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  )
}
