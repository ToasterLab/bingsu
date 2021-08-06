import { useState, useEffect, useCallback } from 'react'
import Logger from '../../utils/Logger'
import Storage from '../../utils/Storage'

const useFiles = () => {
  const [file, setFile] = useState({
    file: {},
    hyperlinks: [],
  } as BingsuFile)
  const [isLoading, setIsLoading] = useState(true)

  const setHyperlinks = useCallback((hyperlinks: Hyperlink[]) => {
    Storage.setHyperlinks(file.file.filePath, hyperlinks)
    setFile({
      ...file,
      hyperlinks,
    })
  }, [file, setFile])

  const setHyperlink = useCallback((index: number, data: Partial<Hyperlink>) => {
    Logger.log(`setHyperlink`, index, data, file.hyperlinks)
    setHyperlinks([
      ...file.hyperlinks.slice(0, index),
      {
        ...file.hyperlinks[index],
        ...data,
      } as Hyperlink,
      ...file.hyperlinks.slice(index + 1),
    ])
  }, [file, setHyperlinks])

  useEffect(() => {
    const files = Storage.getFiles()
    setFile(files[0])
    setIsLoading(false)
  }, [file, setFile])

  return { file, isLoading, setHyperlink }
}

export default useFiles