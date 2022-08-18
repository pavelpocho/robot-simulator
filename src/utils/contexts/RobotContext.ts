import React, { useContext } from 'react';

export type Robot = {
  type: string,
  // Length of these must be determined by robot.type:
  dhTable: LinkParameter[],
  jointPositions: number[],
  cartesianEEPositions: number[],
  // Length of this must be determined by robot.type:
  jointVelocities: number[],
  cartesianEEVelocities: number[],
}

export type LinkParameter = {
  i: number,
  a_i_minus_1: number,
  alpha_i_minus_1: number,
  d_i: number,
  theta_i: number
}

export interface ContextType {
  robot: Robot,
  setRobot: React.Dispatch<React.SetStateAction<Robot>>
}

export const RobotContext = React.createContext<ContextType | null>(null);

export const useRobotContext = () => {
  const value = useContext(RobotContext);
  if (value === null)
    throw new Error('Ilegal use of context');

  return value;
};
