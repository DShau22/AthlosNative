import React, { Component } from 'react'
import {
  Route,
  NavLink,
  Redirect,
  BrowserRouter,
  Switch
} from "react-router-dom";

class TopNav extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link" href="#">1 <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">2</a>
            </li>
            <li class="nav-item">
              <a class="nav-link disabled" href="#">3</a>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}
export default TopNav