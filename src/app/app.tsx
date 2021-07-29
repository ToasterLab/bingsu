import React, { useCallback, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import DropZone from './components/DropZone/'
import './app.scss'
import { MessageType } from '../utils/Constants'
import Logger from '../utils/Logger'

const App = () => {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Logger.log(`onDrop`, file)
    bridgeApi.sendMessage(MessageType.HANDLE_FILE, { filePath: file.path })
  }, [])

  useEffect(() => {
    bridgeApi.on(MessageType.HANDLE_FILE, (data: Record<string, unknown>) => {
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