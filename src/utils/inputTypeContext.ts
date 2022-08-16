import React, { useContext } from 'react';
import { InputType } from '../components/ui/input-type';

export interface ContextType {
  inputType: InputType,
  setInputType: React.Dispatch<React.SetStateAction<InputType>>
}

export const Context = React.createContext<ContextType | null>(null);

export const useInputTypeContext = () => {
  const value = useContext(Context);
  if (!value)
    throw new Error('Ilegal use of context');

  return value;
};
