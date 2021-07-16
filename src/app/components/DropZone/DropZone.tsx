import React from 'react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'
import './DropZone.scss'

const DropZone = () => {

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      return window.alert(`Oops, invalid selection. Please select only 1 DOCX file`)
    }
    console.log(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
  })

  return (
    <div id="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />
      <div id="icon">
        <FiUpload size="100" />
      </div>
      <div id="text">
      {
        isDragActive
          ? <span>drop the file here</span>
          : <span>drag-and-drop a single docx file<br />or click here to select one</span>
        }
      </div>
    </div>
  )
}

export default DropZone