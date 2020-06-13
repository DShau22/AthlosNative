import React, { Component } from 'react'
import {
  getFromLocalStorage,
  getFromSessionStorage,
  storageKey,
} from '../utils/storage';
import ENDPOINTS from "../endpoints"
const updateSettingsURL = ENDPOINTS.updateSettings

function getToken() {
  var lsUserToken = getFromLocalStorage(storageKey)
  var ssUserToken = getFromSessionStorage(storageKey)
  if (lsUserToken) {
    return lsUserToken.token
  } else if (ssUserToken) {
    return ssUserToken.token
  } else {
    return null
  }
}

export default class Stats extends Component {
  constructor(props) {
    super(props)
    this.state = {
      unitSystem: ""
    }
    this.submitSettings = this.submitSettings.bind(this)
    this.radioChange = this.radioChange.bind(this)
  }

  async submitSettings(e) {
    e.preventDefault()
    var reqBody = { ...this.state, userToken: getToken() }
    var res = await fetch(updateSettingsURL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody),
    })
    var json = await res.json()
    alert(json.success)
  }
  
  componentDidMount() {
    // debugger;
  }

  radioChange(e) {
    this.setState({
      unitSystem: e.currentTarget.value
    })
  }

  checkUnitSystem(system) {
    var { unitSystem } = this.state
    if (this.state.unitSystem) {
      return unitSystem === system
    }
    return false
  }

  render() {
    return (
      <div>
        Stats settings
        <form onSubmit={this.submitSettings}>
          <div>
            <label htmlFor="english-units">English</label>
            <input
              id="english-units"
              name="unit-system-input"
              type="radio"
              value="english"
              checked={this.checkUnitSystem("english")}
              onChange={this.radioChange}
            />
            <label htmlFor="metric-units">Metric</label>
            <input
              id="metric-units"
              name="unit-system-input"
              type="radio"
              value="metric"
              checked={this.checkUnitSystem("metric")}
              onChange={this.radioChange}
            />
          </div>
          <div>
            <input type="submit" value="Update"></input>
          </div>
        </form>
      </div>
    )
  }
}
