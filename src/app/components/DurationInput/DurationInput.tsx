import React, { useCallback } from 'react'

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
    const text: number = event.target.value
    onChange(text)
  }, [])

  return (
    <div className="duration-input">
      <label title={description}>{label}</label>
      <input
        type="number"
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