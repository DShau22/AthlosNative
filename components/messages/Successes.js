import React, { Component } from 'react';

class Successes extends Component {
  constructor(props) {
    super(props)
    this.renderDisplay = this.renderDisplay.bind(this)
    this.close = this.close.bind(this)
    this.state={
      successVisible: false
    }
  }

  renderDisplay(visible) {
    if (visible) {
      return {display: "inline"}
    } else {
      return {display: "none"}
    }
  }

  close() {
    this.setState({
      successVisible: false
    })
  }

  render() {
    return (
      <div className="success-container" style={this.renderDisplay(this.state.containerVisible)}>
        <div className="success">
          <span></span>
          <button
            className="close-success"
            onClick={this.close}
            style={this.renderDisplay(this.state.successVisible)}
          >
            &times;
          </button>
        </div>
      </div>
    )
  }
}

export default Successes
