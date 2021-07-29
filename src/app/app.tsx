import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import TitleBar from './components/TitleBar'

import InputPage from './pages/Input'
import ProcessConfirmationPage from './pages/ProcessConfirmation'

import './app.scss'
import Storage from '../utils/Storage'

const App = () => {

  useEffect(() => {
    (async () => {
      await Storage.init()
    })()
  }, [])

  return (
    <div id="app-container">
      <TitleBar />
      <div id="main-app">
        <Router>
          <Switch>
            <Route path="/" >
              <InputPage />
            </Route>
            <Route exact path="/process-confirmation">
              <ProcessConfirmationPage />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  )
}

export default App