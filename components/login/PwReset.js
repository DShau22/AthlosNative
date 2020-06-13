import React, { Component } from 'react';
import { CSSTransition } from "react-transition-group"

class PwReset extends Component {
  render() {
    return (
      <CSSTransition
        in={this.props.showPwReset}
        timeout={250}
        classNames='pwReset'
        appear
        mountOnEnter
        unmountOnExit
      >
        <form id="forget-form" className='mt-4' onSubmit={this.props.onSubmit}>
          <div className="group">
            <label htmlFor="forgot-email" className="label">Email</label>
            <input
              id="forgot-email"
              type="text"
              className="input"
              onChange={this.props.onChange}
            >
            </input>
          </div>
          <div className="group">
            <input type="submit" className="button" value="Request Reset" id="pwResetButton" />
          </div>
        </form>
      </CSSTransition>
    )
  }
}

export default PwReset
