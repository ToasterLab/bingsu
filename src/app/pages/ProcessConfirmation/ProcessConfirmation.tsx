import React from 'react'
import { cleanURL } from '../../../utils/Utils'
import DurationInput from '../../components/DurationInput'
import useFiles from '../../hooks/useFiles'
import useMaxArchiveAge from '../../hooks/useMaxArchiveAge'
import './ProcessConfirmation.scss'

const ProcessConfirmationPage = () => {

  const { file, isLoading } = useFiles()
  const {
    file: {
      fileName,
      directoryName,
    },
    hyperlinks,
  } = file

  const { maxArchiveAge, onMaxArchiveAgeChange } = useMaxArchiveAge()

  return (
    <div id="process-confirmation-page">
      {
        isLoading ? (
          <h1>Processing file...</h1>
        ) : (
          <>
            <div className="file-results">
              <div className="file-info">
                <h1>{fileName}</h1>
                <p>
                  <strong>Folder: </strong>
                  <span>{directoryName}</span>
                </p>
              </div>
              <div className="options">
                <h2>Options</h2>
                <DurationInput
                  label="Max Archive Age (in days)"
                  description={`Re-archive hyperlinks that were archived more than ${maxArchiveAge} days ago`}
                  value={maxArchiveAge}
                  onChange={onMaxArchiveAgeChange}
                  placeholder="30"
                />
              </div>
              <div className="links-list">
                <p>Found {hyperlinks.length} hyperlinks:</p>
                <table>
                  <thead>
                    <tr>
                      <td>Text</td>
                      <td>URL</td>
                    </tr>
                  </thead>
                  <tbody>
                    {hyperlinks.map(({ text, url }, index) => (
                      <tr key={`${text}-${url}-${index}`}>
                        <td>{text}</td>
                        <td>
                          <a href={url} target="_blank">{cleanURL(url)}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="action-bar">
              <a href="#/">
                BACK
              </a>
              <a href="#/archiving">
                PROCEED
              </a>
            </div>
          </>
        )
      }
    </div>
  )
}

export default ProcessConfirmationPage