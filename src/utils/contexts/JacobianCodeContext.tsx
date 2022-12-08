import { EvalFunction, Matrix } from 'mathjs';
import React, { useContext } from 'react';
import { FinalJacobianData } from '../../wrapper';

export interface ContextType {
  jacobianCode: EvalFunction | null,
  allVs: string[],
  allOmegas: string[],
  jacobianSection2DArray: (string[])[],
  finalJacobianData: FinalJacobianData | null,
  evaluatedJac: Matrix | null,
  invertedJac: Matrix | null
  setAllVs: React.Dispatch<React.SetStateAction<string[]>>,
  setAllOmegas: React.Dispatch<React.SetStateAction<string[]>>,
  setJacobianCode: React.Dispatch<React.SetStateAction<EvalFunction | null>>,
  setJacobianSection2DArray: React.Dispatch<React.SetStateAction<(string[])[]>>,
  setFinalJacobianData: React.Dispatch<React.SetStateAction<FinalJacobianData | null>>,
  setEvaluatedJac: React.Dispatch<React.SetStateAction<Matrix | null>>,
  setInvertedJac: React.Dispatch<React.SetStateAction<Matrix | null>>
}

export const JacobianCodeContext = React.createContext<ContextType | null>(null);

export const useJacobianCodeContext = () => {
  const value = useContext(JacobianCodeContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
