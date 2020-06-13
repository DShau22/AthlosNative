import React, { Component } from 'react'
import {
  NavLink,
  withRouter
} from "react-router-dom";
import "./css/sideMenu.css"
import SpaContext from '../Context';

const imgAlt = "../profile/default_profile.png"

class SideMenu extends Component {
  render() {
    const { homeURL, communityURL, fitnessURL, profileURL, settingsURL, logout } = this.props
    return (
      <div className="sidemenu-container">
        <div id="mySidenav" className="sideMenu">
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
SideMenu.contextType = SpaContext
export default withRouter(SideMenu)