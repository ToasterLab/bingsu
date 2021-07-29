import { useState, useEffect } from 'react'
import Storage from '../../utils/Storage'

const useFiles = () => {
  const [file, setFile] = useState({
    file: {},
    hyperlinks: [],
  } as BingsuFile)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const files = Storage.getFiles()
    setFile(files[0])
    setIsLoading(false)
  }, [])

  return { file, isLoading }
}

export default useFiles