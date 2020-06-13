import React, { Component } from 'react'
import { Line } from 'react-chartjs-2';
import "chartjs-plugin-zoom"
import "hammerjs";
import "./DateBar.css"

// converts data to correct format for linear chart with smooth panning
function convertData(data) {
  var newData = {}
  newData = data.map((d, i) => {
    return {
      x: i,
      y: d
    }
  })
  return newData
}

class DateBar extends Component {
  render() {
    return (
      <div style={{
        overflowX: "scroll",
        width: "300px"
      }}>
          <Line
            data={{
              labels: this.props.labels,
              datasets: [{
                  // label: 'awef',
                  data: convertData(this.props.data),
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1
              }]
            }}
            options={{
              scales: {
                xAxes: [{
                  type: "linear",
                  ticks: {
                    stepSize: 1,
                    maxRotation: 0,
                  },
                  position: "bottom",
                  scaleLabel: {
                    display: true,
                    labelString: "Jump"
                  },
                }],
                yAxes: [{
                  type: "linear"
                }]
              },
              animation: {
                easing: "easeInOutSine",
                duration: "1500"
              },
              maintainAspectRatio: false,
              title: {
                text: "Date",
                display: true,
                fontSize: 16
              },
              legend: {
                display: false,
                position: 'right'
              },
              responsive: true,
              plugins: {
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'x',
                    speed: 2,
                    threshold: 10
                  },
                  zoom: {
                    enabled: true,
                    mode: 'x',
                    limits: {
                      max: 10,
                      min: 0.5
                    }
                  }
                }
              }
            }}
          />
      </div>
    )
  }
}

export default DateBar
