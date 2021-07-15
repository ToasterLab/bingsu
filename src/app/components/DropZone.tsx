import React from 'react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

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
      {
        isDragActive
          ? <span>Drop the file here</span>
          : <span>Drag and drop a single DOCX file here or click here to select one</span>
      }
    </div>
  )
}

export default DropZone