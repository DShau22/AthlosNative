import React, { Component } from 'react'
import {
  NavLink,
  withRouter
} from "react-router-dom";
import "./css/sidebar.css"
import SpaContext from '../Context';

const imgAlt = "../profile/default_profile.png"


class Navbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sideNavStyle: {
        width: "0px",
        clicked: false,
        selected: ""
      }
    }
  }

  /* Set the width of the side navigation to 65%. MAKE SURE PARENT HAS WIDTH */
  openNav() {
    document.getElementById("mySidenav").style.width = "65%";
  }

  /* Set the width of the side navigation to 0 */
  closeNav(e) {
    document.getElementById("mySidenav").style.width = "0";
  }

  render() {
    var { homeURL, communityURL, fitnessURL, profileURL, settingsURL, logout } = this.props
    return (
      <div className="navbar-container">
        <span className="expander" onClick={this.openNav}>&#9776;</span>
        <div id="mySidenav" className="sidenav">
          <span className="closebtn" onClick={this.closeNav}>&times;</span>
          <div className="prof-pic-container">
            <img src={this.context.profilePicture.profileURL} height="75%" width="75%" alt={imgAlt}/>
          </div>
          <NavLink 
            className='nav-link'
            exact to={homeURL} 
            onClick={this.closeNav}
          >
            Home
          </NavLink>
          <NavLink 
            className="nav-link"
            to={{pathname: communityURL}}
            onClick={this.closeNav}
          >
            Community
          </NavLink>
          <NavLink
            className="nav-link"
            to={{pathname: fitnessURL}}
            onClick={this.closeNav}
          >
            Fitness
          </NavLink>
          <NavLink
            className="nav-link"
            to={{pathname: profileURL}}
            onClick={this.closeNav}
          >
            Profile
          </NavLink>
          <NavLink
            className='nav-link'
            to={{pathname: settingsURL}}
            onClick={this.closeNav}
          >
            Settings
          </NavLink>
          <span
            className='nav-link'
            onClick={logout}
          >
            Logout
          </span>
        </div>
      </div>
    )
  }
}
Navbar.contextType = SpaContext
export default withRouter(Navbar)