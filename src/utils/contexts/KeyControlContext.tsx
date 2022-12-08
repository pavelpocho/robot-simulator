import React, { useContext } from 'react';
import { InputType } from '../../components/ui/input-type';

export type UpControlKeys = 'q' | 'w' | 'e' | 'u' | 'i' | 'o';
export type DownControlKeys = 'a' | 's' | 'd' | 'j' | 'k' | 'l';

export const upKeys: UpControlKeys[] = [
  'q', 'w', 'e', 'u', 'i', 'o'
];
export const downKeys: DownControlKeys[] = [
  'a', 's', 'd', 'j', 'k', 'l'
];

export interface KeyControlRegistration {
  key: UpControlKeys | DownControlKeys;
  action: () => void;
}

export interface ContextType {
  keyControlRegistrations: KeyControlRegistration[],
  setKeyControlRegistrations: React.Dispatch<React.SetStateAction<KeyControlRegistration[]>>
}

export const KCRContext = React.createContext<ContextType | null>(null);

export const useKCRContext = () => {
  const value = useContext(KCRContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
