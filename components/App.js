import React, { Component } from 'react'
import './App.css'
import {
  BrowserRouter,
} from "react-router-dom";
import Spa from "./Spa"
import "./transitions.css"

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
    }
  }

  render() {
    return (
      <BrowserRouter>
        <Spa />
      </BrowserRouter>
    )
  }
}

export default App
