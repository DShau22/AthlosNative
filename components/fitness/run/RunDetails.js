import React, { Component } from 'react'
// import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import DateBar from "../charts/DateBar"
import Past from "../charts/Past"
import SpaContext from "../../Context"
import {getToken, localStorageKey} from "../../utils/storage"
import ENDPOINTS from "../../endpoints"
const dataURL = ENDPOINTS.getData

class RunDetails extends Component {
  constructor(props) {
    super(props)
    this.state = {
      labels: [],
      data: [],
    }

    this.setJumpData = this.setJumpData.bind(this)
  }

  componentDidMount() {
    this.setJumpData()
  }
  // fetches data by making request to server
  // updates the state if successfull
  setJumpData() {
    var headers = new Headers()
    var token = getToken(localStorageKey)
    headers.append("authorization", `Bearer ${token}`)
    headers.append("activity", "run")

    fetch(dataURL, {
      method: "GET",
      headers: headers,
    })
      .catch( (err) => {
        throw err
      })
      .then( (response) => {
        return response.json()
      })
      .then((json) => {
        if (json.success) {
          // debugger;
          let chartLabels = this.makeLabels(json)
          let chartData = this.getData(json)
          this.setState({
            labels: chartLabels,
            data: chartData
          })
        } else {
          alert(json.message)
        }
      })
  }

  makeLabels(json) {
    // debugger
    var labels = []
    for (var i = 1; i < json.heights.length + 1; i++) {
      labels.push(i)
    }
    return labels
  }

  // each data entry is a vertical height in inches
  getData(json) {
    var data = []
    var heights = json.heights
    heights.forEach(h => {
      data.push(h)
    })
    return data
  }

  render() {
    return (
      <div>
        <DateBar
          labels={this.state.labels}
          data={this.state.data}
        />
        <Past
          labels={this.state.labels}
          data={this.state.data}
        />
      </div>
    )
  }
}

RunDetails.contextType = SpaContext
export default RunDetails
