import React, { Component } from 'react'
import SpaContext from '../../Context';

class Friends extends Component {
  render() {
    var { friendTableRows } = this.context
    return (
      <div>
        <ul className="list-group list-group-flush">
          {friendTableRows}
        </ul>
      </div>
    )
  }
}

Friends.contextType = SpaContext

export default Friends
