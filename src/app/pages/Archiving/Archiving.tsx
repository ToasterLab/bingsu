import React, { useEffect, useCallback } from 'react'
import { MessageType } from '../../../utils/Constants'
import Logger from '../../../utils/Logger'
import Navigator from '../../../utils/Navigator'
import { cleanURL } from '../../../utils/Utils'
import useFiles from '../../hooks/useFiles'
import useHyperlinkStats from '../../hooks/useHyperlinkStats'
import useMaxArchiveAge from '../../hooks/useMaxArchiveAge'
import './Archiving.scss'

const emptyHyperlink: Hyperlink = { id: ``, lastArchiveDate: new Date(), location: `document`, status: `PROCESSING`, text: ``, url: `` }

const Archiving = () => {
  const { file, isLoading, setHyperlink } = useFiles()
  const {
    file: {
      fileName,
    },
    hyperlinks,
  } = file
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const currentHyperlink = hyperlinks[currentIndex] || emptyHyperlink
  const {
    url,
    text,
    status,
    lastArchiveDate,
  } = currentHyperlink

  const {
    erroredHyperlinks,
    progressPercentage,
  } = useHyperlinkStats(hyperlinks)

  const { maxArchiveAge } = useMaxArchiveAge()

  const processHyperlink = useCallback((url: Hyperlink[`url`]) => {
    bridgeApi.sendMessage(MessageType.ARCHIVE_URL, { maxAge: maxArchiveAge, url })
  }, [maxArchiveAge])

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
      const { status, error, url, lastArchiveDate } = data
      if (error) {
        Logger.error(hyperlinks[currentIndex], error)
      }
      setHyperlink(currentIndex, { archivedURL: url, lastArchiveDate, status })
    }

    bridgeApi.on(MessageType.ARCHIVE_URL, handleReply)
    return () => {
      bridgeApi.removeAllListeners(MessageType.ARCHIVE_URL)
    }
  }, [setHyperlink, currentIndex])

  useEffect(() => {
    if (progressPercentage === 100) {
      Navigator.navigateTo(`output`)
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
              {erroredHyperlinks > 0 ? <p>{erroredHyperlinks} errors</p> : null}
            <p>{Number(progressPercentage).toFixed(1)}%</p>
            <div className="hyperlink-info">
              <p>{text}</p>
              <p><a href={url}>{cleanURL(url)}</a></p>
              <p>
                {(status === `EXISTS` && lastArchiveDate)
                  ? `Already archived on ${lastArchiveDate.toLocaleString()}`
                  : (status === `NEW` ? `Archiving now...` : ``)}
              </p>
            </div>
          </>
        )
      }
    </div>
  )
}

export default Archiving