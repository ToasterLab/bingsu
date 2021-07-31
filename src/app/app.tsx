import React, { useEffect } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import TitleBar from './components/TitleBar'

import InputPage from './pages/Input'
import ProcessConfirmationPage from './pages/ProcessConfirmation'
import Archiving from './pages/Archiving'
import Output from './pages/Output'

import './app.scss'
import { MessageType } from '../utils/Constants'

const App = () => {
  const [showTitleBar, setShowTitleBar] = React.useState(true)

  useEffect(() => {
    bridgeApi.sendMessage(MessageType.OS)
    bridgeApi.on(MessageType.OS, (data: Record<`os`, OS>) => {
      const { os } = data
      if (os === `WSL`) {
        setShowTitleBar(false)
      }
    })
  }, [])

  return (
    <div id="app-container">
      {showTitleBar ? <TitleBar /> : null}
      <Router>
        <div id="main-app">
          <Switch>
            <Route exact path="/" >
              <InputPage />
            </Route>
            <Route exact path="/process-confirmation">
              <ProcessConfirmationPage />
            </Route>
            <Route exact path="/archiving">
              <Archiving />
            </Route>
            <Route exact path="/output">
              <Output />
            </Route>
        </Switch>
        </div>
      </Router>
    </div>
  )
}

export default App