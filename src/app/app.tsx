import React from 'react'
import TitleBar from './components/TitleBar'
import DropZone from './components/DropZone/'
import './app.scss'

const App = () => {

  return (
    <div id="app-container">
      <TitleBar />
      <div id="main-app">
        <DropZone />
      </div>
    </div>
  )
}

export default App