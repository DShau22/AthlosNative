import React, { Component } from 'react';
import PwReset from "./PwReset"
import 'react-inputs-validation/lib/react-inputs-validation.min.css';
import { Textbox } from 'react-inputs-validation';
import validator from 'validator';

import ENDPOINTS from "../endpoints"
const forgotUrl = ENDPOINTS.forgotPassword

class SignIn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showPwReset: false,
      pwResetText: '',
      isLoading: false,
    }
    this.renderPwReset = this.renderPwReset.bind(this)
    this.onForgetPwChange = this.onForgetPwChange.bind(this)
    this.toggleReset = this.toggleReset.bind(this)
    this.submitForgotPw = this.submitForgotPw.bind(this)
  }

  renderPwReset() {
    return (
      <PwReset
        onChange={this.onForgetPwChange}
        onSubmit={this.submitForgotPw}
        showPwReset={this.state.showPwReset}
      />
    )
  }

  async submitForgotPw() {
    var reqBody = {
      email: this.state.pwResetText,
    }
    this.setState({
      isLoading: true
    })
    var res = await fetch(forgotUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody),
    })
    var json = await res.json()
    console.log("json: ", json)
    if (json.success) {
      alert("pw reset successfull. Check your email for more instructions")
      // setInStorage("pwResetEmailMsg", {
      //   msg: "Check out your email for reset instructions"
      // })
    } else {
      alert("error" + json.messages.msg)
      // setInStorage("pwResetEmailErr", json.messages)
    }
    this.setState({
      showPwReset: false,
      pwResetText: '',
      isLoading: false
    })
  }

  onForgetPwChange(e) {
    this.setState({
      pwResetText: e.target.value
    })
  }

  toggleReset() {
    let { showPwReset } = this.state
    this.setState({
      showPwReset: !showPwReset
      // showPwReset: true
    })
  }

  render() {
    return (
      <div className="sign-in-htm">
        <form id="signin-form" onSubmit={this.props.onSignIn}>
          <div className="group mt-3">
            <label htmlFor="login-email" className="label">Email</label>
            <Textbox
              attributesInput={{
                id: "signup-email",
                type: "text"
              }}
              value={this.props.signInEmail} //Optional.[String].Default: "".
              onChange={(email, e) => {
                this.props.onEmailChange(e)
                if (validator.isEmpty(email)) {
                  this.props.signInValid[0] = false
                } else {
                  this.props.signInValid[0] = true
                }
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "email", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: email => {
                  if (validator.isEmpty(email)) {
                    this.props.signInValid[0] = false
                    return "cannot be empty"
                  }
                  this.props.signInValid[0] = true
                  return true
                }
              }}
            />
          </div>
          <div className="group">
            <label htmlFor="login-pass" className="label">Password</label>
            <Textbox
              attributesInput={{
                id: "login-pass",
                type: "password"
              }}
              value={this.props.signInPassword} //Optional.[String].Default: "".
              onChange={(pw, e) => {
                this.props.onPwChange(e);
                if (validator.isEmpty(pw)) {
                  this.props.signInValid[1] = false
                } else {
                  this.props.signInValid[1] = true
                }
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "email", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: email => {
                  if (validator.isEmpty(email)) {
                    this.props.signInValid[1] = false
                    return "cannot be empty"
                  }
                  this.props.signInValid[1] = true
                  return true
                }
              }}
            />
          </div>
          <div className="group">
            <input id="check" type="checkbox" className="check" onClick={this.props.onCheck}/>
            <label htmlFor="check">
              <span className="icon"></span> Keep me Signed In
            </label>
          </div>
          <div className="group">
            <input type="submit" className="button" value="Sign In" id="signInButton" />
          </div>
          <div className="hr"></div>
        </form>
        <div className="foot-lnk">
          <p id="forgot-link" onClick={this.toggleReset}>Forgot Password?</p>
          {this.renderPwReset()}
        </div>
      </div>
    )
  }
}

export default SignIn
