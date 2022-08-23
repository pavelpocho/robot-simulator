import { EvalFunction } from 'mathjs';
import React, { useContext } from 'react';

export interface ContextType {
  jacobianCode: EvalFunction | null,
  setJacobianCode: React.Dispatch<React.SetStateAction<EvalFunction | null>>
}

export const JacobianCodeContext = React.createContext<ContextType | null>(null);

export const useJacobianCodeContext = () => {
  const value = useContext(JacobianCodeContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
