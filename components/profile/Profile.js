import React, { Component } from 'react';
import {
  withRouter
} from "react-router-dom";
import UserProfile from "./UserProfile"
import SearchProfile from "./SearchProfile"
import SpaContext from '../Context';

class Profile extends Component {
  render() {
    var { context } = this
    var { username } = this.props.match.params
    // debugger;
    if (username === context.username) {
      // this is the same user who is looking at their own profile
      return ( <UserProfile/> )
    }
    return ( <SearchProfile/> )
  }
}
Profile.contextType = SpaContext

export default withRouter(Profile)
