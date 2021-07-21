import React from 'react'
import TitleBar from './components/TitleBar'
import DropZone from './components/DropZone/'
import './app.scss'
import { useCallback } from 'react'
import { useEffect } from 'react'

const App = () => {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    bridgeApi.sendMessage(`handleFile`, { file })
  }, [])

  useEffect(() => {
    bridgeApi.on(`handleFile`, (data: Record<string, unknown>) => {
      console.log(`renderer`, data)
    })
  }, [])

  return (
    <div id="app-container">
      <TitleBar />
      <div id="main-app">
        <DropZone onDrop={onDrop} />
      </div>
    </div>
  )
}

export default App