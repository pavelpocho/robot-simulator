import React from "react"

interface Props {
  label: string;
  value: number;
  disabled: boolean;
  setValue: React.Dispatch<React.SetStateAction<number>> | ((n: number) => void);
  step?: number;
}

export const Input: React.FC<Props> = ({label, value, setValue, disabled, step}) => {
  return <label className='label-wrap'>
    <p className='input-label'>{label}</p>
    { disabled ? 
      <p className="input-text" style={{ paddingRight: '48px' }}>{value.toFixed(3)}</p> :
      <>
        <input step={step} type='number' onChange={(e) => { if (parseFloat(e.currentTarget.value).toString() === e.currentTarget.value) setValue(parseFloat(e.currentTarget.value))}} value={value} />
      </>
    }
  </label>
}