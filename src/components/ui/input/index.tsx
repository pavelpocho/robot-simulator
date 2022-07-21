import React from "react"

interface Props {
  label: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

export const Input: React.FC<Props> = ({label, value, setValue}) => {
  return <label>
    <p>{label}</p>
    <input type='number' onChange={(e) => setValue(parseInt(e.currentTarget.value))} value={value} />
  </label>
}