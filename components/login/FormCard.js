import React, { Component } from 'react';
import SignInFunc from "./SignInFunc"
import SignUpFunc from "./SignUpFunc"
class FormCard extends Component {
  render() {
    return (
      <div className="headers">
        <input
          id="tab-1"
          type="radio"
          name="tab"
          className="sign-in"
          checked={this.props.renderSignIn}
          onChange={this.props.onSignInClick}
        >
        </input>
        <label htmlFor="tab-1" className="tab">Sign In</label>
        <input
          id="tab-2"
          type="radio"
          name="tab"
          className="sign-up"
          checked={!this.props.renderSignIn}
          onChange={this.props.onSignUpClick}
        >
        </input><label htmlFor="tab-2" className="tab">Sign Up</label>
        <div className="login-form">
          <SignInFunc 
            onSignIn={this.props.onSignIn}
          />
          <SignUpFunc
            onSignUp={this.props.onSignUp}
          />
        </div>
      </div>
    )
  }
}

export default FormCard
