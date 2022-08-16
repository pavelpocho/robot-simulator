import React, { useEffect, useRef } from "react"

interface Props {
  label: string;
  value: number;
  disabled: boolean;
  setValue: React.Dispatch<React.SetStateAction<number>> | ((n: number) => void);
}

export const Input: React.FC<Props> = ({label, value, setValue, disabled}) => {
  return <label className='label-wrap'>
    <p className='input-label'>{label}</p>
    { disabled ? 
      <p className="input-text" style={{ paddingRight: '48px' }}>{value.toFixed(3)}</p> :
      <>
        <input type='number' onChange={(e) => { if (parseFloat(e.currentTarget.value).toString() === e.currentTarget.value) setValue(parseFloat(e.currentTarget.value))}} value={value} />
      </>
    }
  </label>
}