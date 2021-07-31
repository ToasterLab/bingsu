import React, { useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { MessageType } from '../../../utils/Constants'
import Logger from '../../../utils/Logger'
import useFiles from '../../hooks/useFiles'
import useHyperlinkStats from '../../hooks/useHyperlinkStats'

const Archiving = () => {
  const history = useHistory()
  const { file, isLoading, setHyperlink } = useFiles()
  const {
    file: {
      fileName,
    },
    hyperlinks,
  } = file
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const currentHyperlink = hyperlinks[currentIndex] || { url: `` }
  const {
    url,
  } = currentHyperlink

  const {
    erroredHyperlinks,
    progressPercentage,
  } = useHyperlinkStats(hyperlinks)

  const processHyperlink = useCallback((url: Hyperlink[`url`]) => {
    bridgeApi.sendMessage(MessageType.ARCHIVE_URL, { url })
  }, [])

  useEffect(() => {
    const doneProcessing = hyperlinks.findIndex(h => h.status === `PROCESSING`) === -1
    if (doneProcessing) {
      const nextIndex = hyperlinks.findIndex(hyperlink => hyperlink.status === `UNPROCESSED`)
      if (nextIndex !== -1) {
        Logger.log(`archiving URL`, hyperlinks[nextIndex].url, nextIndex)
        processHyperlink(hyperlinks[nextIndex].url)
        setHyperlink(nextIndex, { status: `PROCESSING` })
        setCurrentIndex(nextIndex)
      }
    }
  }, [hyperlinks, processHyperlink, setHyperlink, setCurrentIndex])

  useEffect(() => {
    const handleReply = (data: ArchiveURLPayload) => {
      Logger.log(`archive result`, data, currentIndex)
      const { status, error, url } = data
      if (error) {
        Logger.error(hyperlinks[currentIndex], error)
      }
      setHyperlink(currentIndex, { archivedURL: url, status })
    }

    bridgeApi.on(MessageType.ARCHIVE_URL, handleReply)
    return () => {
      bridgeApi.removeAllListeners(MessageType.ARCHIVE_URL)
    }
  }, [setHyperlink, currentIndex])

  useEffect(() => {
    if (progressPercentage === 100) {
      history.push(`/output`)
    }
  }, [progressPercentage])

  return (
    <div id="archiving-page">
      {
        isLoading ? (
          <h1>Processing file...</h1>
        ) : (
          <>
            <h1>{fileName}</h1>
            <p>{erroredHyperlinks} errors</p>
            <p>{progressPercentage}%</p>
            <p>{url}</p>
          </>
        )
      }
    </div>
  )
}

export default Archiving