import { useCallback, useEffect, useState } from "react"
import { URL_MAX_AGE } from "../../utils/Constants"
import Storage from "../../utils/Storage"

const useMaxArchiveAge = () => {
  const [maxArchiveAge, setMaxArchiveAge] = useState(URL_MAX_AGE)
  const onMaxArchiveAgeChange = useCallback((value: number) => {
    Storage.setMaxArchiveAge(value)
    setMaxArchiveAge(value)
  }, [setMaxArchiveAge])
  
  useEffect(() => {
    setMaxArchiveAge(Storage.getMaxArchiveAge())
  }, [])
  
  return {
    maxArchiveAge,
    onMaxArchiveAgeChange,
  }
}

export default useMaxArchiveAge