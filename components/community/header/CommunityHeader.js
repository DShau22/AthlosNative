import React, { Component } from 'react'
import {
  withRouter
} from "react-router-dom";

class CommunityHeader extends Component {
  render() {
    console.log(this.props)
    return (
      <div className="community-header">
        <nav className="navbar navbar-expand sticky bg-light">
          <ul className="navbar-nav">
            <li className="nav-item">
              <span 
                className='nav-link mr-3' 
                onClick={() => {this.props.setDisplay('friends')}}
              >
                Friends
              </span>
            </li>
            <li className="nav-item mr-3">
              <span
                className='nav-link'
                onClick={() => {this.props.setDisplay('requests')}}
              >
                Requests
              </span>
            </li>
            <li className="nav-item">
              <span
                className='nav-link'
                onClick={() => {this.props.setDisplay('search')}}
              >
                Search
              </span>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default withRouter(CommunityHeader)
