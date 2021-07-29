import React from 'react'
import ReactDOM from 'react-dom'
import Storage from './utils/Storage'

import App from './app'

Storage.init()

ReactDOM.render(
  <App />,
  document.querySelector(`#root`),
)