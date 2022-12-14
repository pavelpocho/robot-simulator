import React, { useContext } from 'react';
import { InputType } from '../../components/ui/input-type';

export interface ContextType {
  inputType: InputType | null,
  setInputType: React.Dispatch<React.SetStateAction<InputType | null>>
}

export const InputTypeContext = React.createContext<ContextType | null>(null);

export const useInputTypeContext = () => {
  const value = useContext(InputTypeContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
