import React from 'react'
import { useCallback } from 'react'
import { FiMinus, FiX } from 'react-icons/fi'
import type { bridgeApiType } from '../../../electron/bridge'
import './TitleBar.scss'

declare var bridgeApi: bridgeApiType

const TitleBar = () => {

  const onMinimise = useCallback(() => bridgeApi.sendMessage(`minimise`), [])
  const onClose = useCallback(() => bridgeApi.sendMessage(`close`), [])

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