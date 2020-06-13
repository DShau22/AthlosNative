import React, { Component } from 'react';

class Errors extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      closeEmailExistsVisible: this.props.closeEmailExists,
      closeInvalidPasswordVisible: this.props.closeInvalidPasswordVisible,
      closePasswordsMustMatchVisible: this.props.closePasswordsMustMatchVisible,
    }
    this.renderDisplay = this.renderDisplay.bind(this)
    this.closeEmailExists = this.closeEmailExists.bind(this)
    this.closeInvalidPassword = this.closeInvalidPassword.bind(this)
    this.closePasswordsMustMatch = this.closePasswordsMustMatch.bind(this)
  }

  renderDisplay(visible) {
    if (visible) {
      return {display: "inline"}
    } else {
      return {display: "none"}
    }
  }

  closeEmailExists() {
    this.setState({
      closeEmailExistsVisible: false,
    })
  }

  closeInvalidPassword() {
    this.setState({
      closeInvalidPasswordVisible: false,
    })
  }

  closePasswordsMustMatch() {
    this.setState({
      closePasswordsMustMatchVisible: false,
    })
  }

  render() {
    return (
      <div className="errors-container">
        <div className="error" style={this.renderDisplay(this.state.closeEmailExistsVisible)}>
          <span></span>
          <button
            className="close-error"
            onClick={this.closeEmailExists}
          >
            &times;
          </button>
        </div>
        <div className="error" style={this.renderDisplay(this.state.closePasswordsMustMatchVisible)}>
          <span></span>
          <button
            className="close-error"
            onClick={this.closeInvalidPassword}
          >
            &times;
          </button>
        </div>
        <div className="error" style={this.renderDisplay(this.state.closeInvalidPasswordVisible)}>
          <span></span>
          <button
            className="close-error"
            onClick={this.closePasswordsMustMatch}
          >
            &times;
          </button>
        </div>
      </div>
    )
  }
}

export default Errors
