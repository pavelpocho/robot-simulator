import React, { useContext } from 'react';
import { AR } from '../../components/ui/position-control';

export interface ContextType {
  angleRepresentation: AR,
  setAngleRepresentation: React.Dispatch<React.SetStateAction<AR>>
}

export const AngleRepresentationContext = React.createContext<ContextType | null>(null);

export const useAngleRepresentationContext = () => {
  const value = useContext(AngleRepresentationContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
