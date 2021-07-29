import React, { useCallback } from 'react'
import { FiMinus, FiX } from 'react-icons/fi'
import { MessageType } from '../../../utils/Constants'
import './TitleBar.scss'

const TitleBar = () => {
  const onMinimise = useCallback(() => bridgeApi.sendMessage(MessageType.MINIMISE), [])
  const onClose = useCallback(() => bridgeApi.sendMessage(MessageType.CLOSE), [])

  return (
    <header id="title-bar">
      <div id="title">
        <strong>Bingsu</strong>
      </div>
      <div id="drag-region">
      </div>
      <div id="window-controls">
        <div className="icon" onClick={onMinimise}>
          <FiMinus size="26" />
        </div>
        <div className="icon" onClick={onClose}>
          <FiX size="26" />
        </div>
      </div>
    </header>
  )
}

export default TitleBar