import React, { Component } from 'react';
// const regexWhitelist = '^[a-zA-Z0-9]'
import 'react-inputs-validation/lib/react-inputs-validation.min.css';
import { Textbox } from 'react-inputs-validation';
import validator from 'validator';
var passwordValidator = require('password-validator');
var passSchema = new passwordValidator();
passSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits()                                 // Must have digits
.has().not().spaces()                           // Should not have spaces

class SignUp extends Component {

  render() {
    console.log(this.props.signUpValid)
    return (
      <div className="sign-up-htm">
        <form id="signup-form" onSubmit={this.props.onSubmit}>
          <div className="group mt-3">
            <label htmlFor="signup-email" className="label">Email Address</label>
            <Textbox
              attributesInput={{
                id: "signup-email",
                type: "text"
              }}
              value={this.props.signUpEmail} //Optional.[String].Default: "".
              onChange={(email, e) => {
                this.props.onEmailChange(e)
                if (validator.isEmail(email)) {
                  this.props.signUpValid[0] = true
                } else {
                  this.props.signUpValid[0] = false
                }
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "email", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: email => {
                  if (validator.isEmail(email)) {
                    this.props.signUpValid[0] = true
                    return true
                  }
                  this.props.signUpValid[0] = false
                  return "please enter a valid email"
                }
              }}
            />
          </div>
          <div className="group">
            <label htmlFor="signup-pass" className="label">Password</label>
            <Textbox
              attributesInput={{
                id: "signup-pass",
                type: "password"
              }}
              value={this.props.signUpPassword} //Optional.[String].Default: "".
              onChange={(pass, e) => {
                this.props.onPwChange(e)
                if (passSchema.validate(pass)) {
                  this.props.signUpValid[1] = true
                }
                this.props.signUpValid[1] = false
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "pass", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: pass => {
                  if (passSchema.validate(pass)) {
                    this.props.signUpValid[1] = true
                    return true
                  }
                  this.props.signUpValid[1] = false
                  return "Must contain at least one number, one uppercase and one lowercase letter. Must be 8+ characters long and have no spaces."
                }
              }}
            />
          </div>
          <div className="group">
            <label htmlFor="rep-pass" className="label">Repeat Password</label>
            <Textbox
              attributesInput={{
                id: "rep-pass",
                type: "password"
              }}
              value={this.props.signUpPasswordConf} //Optional.[String].Default: "".
              onChange={(passConf, e) => {
                this.props.onPwConfChange(e)
                if (passSchema.validate(passConf)) {
                  this.props.signUpValid[2] = true
                }
                this.props.signUpValid[2] = false
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "passConf", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: passConf => {
                  if (passSchema.validate(passConf)) {
                    this.props.signUpValid[2] = true
                    return true
                  }
                  this.props.signUpValid[2] = false
                  return "Must contain at least one number, one uppercase and one lowercase letter. Must be 8+ characters long and have no spaces."
                }
              }}
            />
          </div>
          <div className="group">
            <label htmlFor="username-input" className="label">Username</label>
            <Textbox
              attributesInput={{
                id: "username-input",
                type: "text"
              }}
              value={this.props.signUpUserName} //Optional.[String].Default: "".
              onChange={(username, e) => {
                this.props.onSignUpUserNameChange(e)
                if (validator.isAlphanumeric(username)) {
                  this.props.signUpValid[3] = true
                }
                this.props.signUpValid[3] = false
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "username", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: username => {
                  if (validator.isAlphanumeric(username)) {
                    this.props.signUpValid[3] = true
                    return true
                  }
                  this.props.signUpValid[3] = false
                  return "Must only contain alphanumeric characters and have no spaces."
                }
              }}
            />
          </div>
          <div className="group">
            <label htmlFor="first-name" className="label">First Name</label>
            <Textbox
              attributesInput={{
                id: "first-name",
                type: "text"
              }}
              value={this.props.signUpFirstName} //Optional.[String].Default: "".
              onChange={(fname, e) => {
                this.props.onFirstNameChange(e)
                if (validator.isAlpha(fname)) {
                  this.props.signUpValid[4] = true
                }
                this.props.signUpValid[4] = false
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "firstName", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: fname => {
                  if (validator.isAlpha(fname)) {
                    this.props.signUpValid[4] = true
                    return true
                  }
                  this.props.signUpValid[4] = false
                  return "Must only contain letters and have no spaces."
                }
              }}
            />
          </div>
          <div className="group">
            <label htmlFor="last-name" className="label">Last Name</label>
            <Textbox
              attributesInput={{
                id: "last-name",
                type: "text"
              }}
              value={this.props.signUpLastName} //Optional.[String].Default: "".
              onChange={(lname, e) => {
                this.props.onLastNameChange(e)
                if (validator.isAlpha(lname)) {
                  this.props.signUpValid[5] = true
                }
                this.props.signUpValid[5] = false
              }}
              onBlur={e => {}} //Optional.[Func].Default: none. In order to validate the value on blur, you MUST provide a function, even if it is an empty function. Missing this, the validation on blur will not work.
              validationOption={{
                name: "lastName", //Optional.[String].Default: "". To display in the Error message. i.e Please enter your {name}.
                check: true, //Optional.[Bool].Default: true. To determin if you need to validate.
                required: true, //Optional.[Bool].Default: true. To determin if it is a required field.
                customFunc: lname => {
                  if (validator.isAlpha(lname)) {
                    this.props.signUpValid[5] = true
                    return true
                  }
                  this.props.signUpValid[5] = false
                  return "Must only contain letters and have no spaces."
                }
              }}
            />
          </div>
          <div className="group">
            <input
              type="submit"
              className="button"
              value="Sign Up"
              id="signUpButton"
            />
          </div>
          <div className="hr"></div>
          <div className="foot-lnk">
            <label id='already-member' htmlFor="tab-1"> Already a Member? </label>
          </div>
        </form>
      </div>
    )
  }
}

export default SignUp
