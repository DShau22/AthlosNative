// bootstrap imports for webpack
import 'bootstrap/dist/css/bootstrap.css';
// import $ from 'jquery';
// import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

//core ui
import "@coreui/coreui"

//font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
// import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee, faAtom, faFireAlt, faClock } from '@fortawesome/free-solid-svg-icons'

import App from './App.js'

library.add(faCheckSquare, faCoffee, faAtom, faFireAlt, faClock)

ReactDOM.render(<App />, document.getElementById('root'))
