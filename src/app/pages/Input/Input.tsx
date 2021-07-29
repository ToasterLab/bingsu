import React, { useCallback, useEffect } from 'react'
import DropZone from '../../components/DropZone/'
import { MessageType } from '../../../utils/Constants'
import Logger from '../../../utils/Logger'
import './Input.scss'
import Storage from '../../../utils/Storage'

const InputPage = () => {

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Logger.log(`onDrop`, file)
    bridgeApi.sendMessage(MessageType.HANDLE_FILE, { filePath: file.path })
  }, [])

  useEffect(() => {
    bridgeApi.on(MessageType.HANDLE_FILE, (data: Record<string, unknown>) => {
      const { file, hyperlinks } = data
      console.log(`renderer`, data)
      Storage.setFile(file as DOCXFile, hyperlinks as Hyperlink[])
    })
  }, [])

  return (
    <DropZone onDrop={onDrop} />
  )
}

export default InputPage