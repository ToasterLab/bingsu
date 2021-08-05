import React from 'react'
import { cleanURL } from '../../../utils/Utils'
import useFiles from '../../hooks/useFiles'
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
              <div className="links-list">
                <p>Found {hyperlinks.length} hyperlinks:</p>
                <table>
                  <thead>
                    <tr>
                      <td>No.</td>
                      <td>Text</td>
                      <td>URL</td>
                    </tr>
                  </thead>
                  <tbody>
                    {hyperlinks.map(({ text, url }, index) => (
                      <tr key={`${text}-${url}-${index}`}>
                        <td>{index + 1}</td>
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