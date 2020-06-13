import React, { Component } from 'react'
import SpaContext from '../Context'
import Particles from 'react-particles-js';
class Home extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       
    }
  }
  render() {
    var { context } = this
    return (
      <div className='homepage'>
        <h1>Welcome, {context.firstName}</h1>
        <Particles
          className='particles-container'
          params={{
            "particles": {
              "number": {
                "value": 50
              },
              "size": {
                "value": 3
              },
              'line_linked': {
                opacity: .6
              }
            },
            "interactivity": {
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "grab"
                },
              },
              'modes': {
                'grab': {
                  'line_linked': {
                    opacity: .9,
                  },
                  'distance': 200,
                }
              }
            }
          }}
        />
      </div>
    )
  }
}
Home.contextType = SpaContext
export default Home
