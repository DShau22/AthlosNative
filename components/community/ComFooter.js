import React, { Component } from 'react'
import "./Community.css"
import {
  NavLink,
} from "react-router-dom";

class ComFooter extends Component {
  render() {
    return (
      <div className="comFooter">
        <ul className="comFooterList">
          <li>Manage Friends</li>
          <li>Competition</li>
          <li><NavLink activeClassName="navLink" to="Downloads">Downloads</NavLink></li>
        </ul>
      </div>
    )
  }
}

export default ComFooter
