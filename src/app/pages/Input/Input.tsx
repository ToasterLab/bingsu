import React, { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import DropZone from '../../components/DropZone/'
import { MessageType } from '../../../utils/Constants'
import Logger from '../../../utils/Logger'
import './Input.scss'
import Storage from '../../../utils/Storage'

const InputPage = () => {

  const history = useHistory()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Logger.log(`onDrop`, file)
    bridgeApi.sendMessage(MessageType.HANDLE_FILE, { filePath: file.path })
  }, [])

  useEffect(() => {
    bridgeApi.on(MessageType.HANDLE_FILE, (data: Record<string, unknown>) => {
      const { file, hyperlinks } = data
      Storage.clear()
      Storage.setFile(file as DOCXFile, hyperlinks as Hyperlink[])
      history.push(`/process-confirmation`)
    })
  }, [])

  return (
    <div id="input-page">
      <DropZone onDrop={onDrop} />
    </div>
  )
}

export default InputPage