import React, { useCallback } from 'react'
import './DurationInput.scss'

type Props = {
  min?: number,
  max?: number,
  label?: string,
  placeholder?: string,
  value?: number,
  onChange?: Function,
  description?: string,
}

const DurationInput: React.FC<Props> = ({
  label = `Duration Input`,
  description = ``,
  min = 0,
  max = 365,
  placeholder = ``,
  value = 0,
  onChange = () => {},
} = {}) => {
  const onNumberChange = useCallback((event) => {
    const number: number = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(number)) {
      onChange(min)
    } else if (number >= min && number <= max) {
      onChange(number)
    }
  }, [])

  return (
    <div className="duration-input">
      <label title={description}>{label}</label>
      <input
        type="text"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={onNumberChange}
      />
    </div>
    
  )
}

export default DurationInput