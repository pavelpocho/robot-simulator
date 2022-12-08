import { ObjectMap } from '@react-three/fiber';
import React, { useContext } from 'react';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface ContextType {
  statorRotor: GLTF & ObjectMap,
  stator: GLTF & ObjectMap
}

export const RotorStatorContext = React.createContext<ContextType | null>(null);

export const useRotorStatorContext = () => {
  const value = useContext(RotorStatorContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
