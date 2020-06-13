import React, { Component } from 'react'
import Run from "./run/Run"
import Jump from "./jump/Jump"
import Swim from "./swim/Swim"
import "./Fitness.css"
import SpaContext from "../Context"
// import { CSSTransition, TransitionGroup } from 'react-transition-group'
import './fitnessTransitions.css'

class Fitness extends Component {
  constructor(props) {
    super(props)

    this.state = {
      display: true,
      activityDisplay: "", // which activity to display
    }
    this.renderActivity = this.renderActivity.bind(this)
    this.changeActivityDisplay = this.changeActivityDisplay.bind(this)
  }

  renderActivity() {
    var { activityDisplay } = this.state
    var { runJson, jumpJson, swimJson } = this.context
    if (activityDisplay === "run") {
      return ( <Run id='run' activityJson={runJson}/> )
    } else if (activityDisplay === "jump") {
      return ( <Jump id='jump' activityJson={jumpJson}/> )
    } else if (activityDisplay === "swim") {
      return ( <Swim id='swim' activityJson={swimJson}/> )
    } else {
      return ( <div className='no-activity-container'> <span>pick an activity</span> </div>)
    }
  }

  changeActivityDisplay(activity) {
    //debugger;
    this.setState({
      activityDisplay: activity,
      showTransition: true,
    })
  }

  render() {
    var { activityDisplay } = this.state
    return (
      <div className="fitness-container">
        <div className="card-header fitness-header">Activity:</div>
        <nav className="navbar navbar-expand navbar-text sticky bg-light">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item mx-4">
              <span 
                className={`run-link nav-link ${(activityDisplay === "run") ? "active" : ""}`}
                onClick={() => {this.changeActivityDisplay("run")}}
              >
                Run
              </span>
            </li>
            <li className="nav-item mx-4">
              <span
                className={`swim-link nav-link ${(activityDisplay === "swim") ? "active" : ""}`}
                onClick={() => {this.changeActivityDisplay("swim")}}
              >
                Swim
              </span>
            </li>
            <li className="nav-item mx-4">
              <span
                className={`jump-link nav-link ${(activityDisplay === "jump") ? "active" : ""}`}
                onClick={() => {this.changeActivityDisplay("jump")}}
              >
                Jump
              </span>
            </li>
          </ul>
        </nav>
        {/* <TransitionGroup>
          <CSSTransition
            key={this.state.activityDisplay}
            timeout={600}
            classNames='fitnessFade'
          > */}
            { this.renderActivity() }
          {/* </CSSTransition>
        </TransitionGroup> */}
      </div>
    )
  }
}

// consume the context provided by the SPA
Fitness.contextType = SpaContext

export default Fitness;
