import React, { useEffect } from 'react'
import Storage from '../../../utils/Storage'
import useFiles from '../../hooks/useFiles'
import useHyperlinkStats from '../../hooks/useHyperlinkStats'

const Output = () => {

  const { file, isLoading } = useFiles()

  const {
    erroredHyperlinks,
    totalHyperlinks,
  } = useHyperlinkStats(file.hyperlinks)

  useEffect(() => {
    return () => {
      Storage.clear()
    }
  }, [])

  return (
    <div id="output-page">
      {isLoading
        ? (
          <h1>Processing results</h1>
        ) : (
          <>
            <h1>Done</h1>
            <p>Archived {totalHyperlinks} hyperlinks. There were {erroredHyperlinks} errors.</p>
            <a href="/#/">Another file?</a>
          </>
        )
        }
    </div>
  )
}

export default Output