import React, { Component } from 'react';
import {
  NavLink,
  withRouter
} from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class RedirectBox extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    var { linkText, redirectURL } = this.props
    console.log(redirectURL)
    return (
      <div className="redirect-box" style={protoStyle}>
        <p>add img later</p>
        <NavLink to={`${redirectURL}`}>{linkText}</NavLink>
      </div>
    )
  }
}

const protoStyle = {
  "border": "solid",
  "marginTop": "20px",
  "marginLeft": "20px",
  "marginRight": "20px",
  "width": "135px",
  "height": "115px"
}

export default withRouter(RedirectBox)
