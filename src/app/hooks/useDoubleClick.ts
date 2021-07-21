import { useEffect } from "react"

const useDoubleClick = ({
  ref,
  duration = 300,
  onDoubleClick = (event) => {},
}) => {
  useEffect(() => {
    const clickRef = ref.current

    let clicks = 0

    const handleClick = (event) => {
      clicks++

      setTimeout(() => {
        if(clicks === 1){
          // single click
        } else if (clicks === 2){
          onDoubleClick(event)
        }
        clicks = 0
      }, duration)
    }

    clickRef.addEventListener(`click`, handleClick)

    return () => {
      clickRef.removeEventListener(`click`, handleClick)
    }
  })
}

export default useDoubleClick