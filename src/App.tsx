import './App.css'
import { Robot, RobotContext } from './utils/contexts/RobotContext'
import { InputType } from './components/ui/input-type'
import Wrapper from './wrapper'
import { useState } from 'react'
import { InputTypeContext } from './utils/contexts/InputTypeContext'

const App = () => {

  const [ inputType, setInputType ] = useState<InputType>(InputType.FwdKin);
  const [ robot, setRobot ] = useState<Robot>({
    type: 'RRRE',
    jointPositions: [0, 0, 0],
    dhTable: [
      { i: 1, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
      { i: 2, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
      { i: 3, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
      { i: 4, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
    ],
    cartesianEEPositions: [0, 0, 0, 0, 0, 0],
    jointVelocities: [0, 0, 0],
    cartesianEEVelocities: [0, 0, 0, 0, 0, 0]
  });

  return <InputTypeContext.Provider value={{ inputType, setInputType }}>
    <RobotContext.Provider value={{ robot, setRobot }}>
      <Wrapper />
    </RobotContext.Provider>
  </InputTypeContext.Provider>
}

export default App
