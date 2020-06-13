import React, { Component } from 'react'
import './App.css'
import {
  Route,
  withRouter,
} from "react-router-dom";

import Login from "./login/Login"
import Confirmation from "./login/Confirmation"
import PwResetPage from "./login/PwResetPage"

import Header from "./home/Header"
import "./transitions.css"

// server url
const root = "/app"

class Spa extends Component {
  render() {
    console.log("rendering spa...")
    return (
      <div className="App">
        <Route exact path="/" component={Login} />
        <Route path="/confirmation" component={Confirmation} />
        <Route path="/pwResetPage" component={PwResetPage} /> 
        {/* intentionally render the header component with all the others (no switch) */}
        <Route path={`${root}`} component={Header}/>
      </div>
    )
  }
}

export default withRouter(Spa)
