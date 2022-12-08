import './App.css'
import { Robot, RobotContext } from './utils/contexts/RobotContext'
import { InputType } from './components/ui/input-type'
import Wrapper, { AR, FinalJacobianData } from './wrapper'
import { useEffect, useState } from 'react'
import { InputTypeContext } from './utils/contexts/InputTypeContext'
import { EvalFunction, Matrix } from 'mathjs'
import { JacobianCodeContext } from './utils/contexts/JacobianCodeContext'
import { AngleRepresentationContext } from './utils/contexts/AngleRepresentationContext'
import { MantineProvider } from '@mantine/core'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RotorStatorContext } from './utils/contexts/RotorStatorContext'
import { KCRContext, KeyControlRegistration } from './utils/contexts/KeyControlContext'

const App = () => {

  // Default 3R
  // const [ robot, setRobot ] = useState<Robot>({
  //   type: 'RRRE',
  //   jointPositions: [1.57, -0.785, -0.785],
  //   dhTable: [
  //     { i: 1, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: 1.57 },
  //     { i: 2, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: -0.785 },
  //     { i: 3, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: -0.785 },
  //     { i: 4, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
  //   ],
  //   cartesianEEPositions: [0, 0, 0, 0, 0, 0, 0],
  //   jointVelocities: [0, 0, 0],
  //   cartesianEEVelocities: [0, 0, 0, 0, 0, 0],
  //   ikUpdate: false,
  //   fkUpdate: false,
  //   angleRepresentation: AR.XYZFixed
  // });

  // 6R Pieper robot
  const [ robot, setRobot ] = useState<Robot>({
    type: 'RRRRRRE',
    jointPositions: [0, 0, 1.57, 0, 0, 0],
    dhTable: [
      { i: 1, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 2, theta_i: 0 },
      { i: 2, a_i_minus_1: 0, alpha_i_minus_1: -1.57, d_i: 1.5, theta_i: 0.06 },
      { i: 3, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: -1.5, theta_i: 1.51 },
      { i: 4, a_i_minus_1: 0, alpha_i_minus_1: 1.57, d_i: 2, theta_i: 0 },
      { i: 5, a_i_minus_1: 0, alpha_i_minus_1: -1.57, d_i: 0, theta_i: 0 },
      { i: 6, a_i_minus_1: 0, alpha_i_minus_1: 1.57, d_i: 0, theta_i: 0 },
      { i: 7, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
    ],
    cartesianEEPositions: [0, 0, 0, 0, 0, 0, 0],
    jointVelocities: [0, 0, 0],
    cartesianEEVelocities: [0, 0, 0, 0, 0, 0],
    ikUpdate: false,
    fkUpdate: false,
    angleRepresentation: AR.XYZFixed
  });

  const [ inputType, setInputType ] = useState<InputType | null>(null);
  const [ angleRepresentation, setAngleRepresentation ] = useState<AR>(AR.XYZFixed);

  const [ jacobianCode, setJacobianCode ] = useState<EvalFunction | null>(null);
  const [ allVs, setAllVs ] = useState<string[]>([]);
  const [ finalJacobianData, setFinalJacobianData ] = useState<FinalJacobianData | null>(null);
  const [ allOmegas, setAllOmegas ] = useState<string[]>([]);
  const [ evaluatedJac, setEvaluatedJac ] = useState<Matrix | null>(null);
  const [ invertedJac, setInvertedJac ] = useState<Matrix | null>(null);
  const [ jacobianSection2DArray, setJacobianSection2DArray ] = useState<(string[])[]>([]);
  const [ keyControlRegistrations, setKeyControlRegistrations ] = useState<KeyControlRegistration[]>([]);
  // const statorRotor = useLoader(GLTFLoader, 'src/components/robot/3d-joint/stator_rotor_v4.glb');
  // const stator = useLoader(GLTFLoader, 'src/components/robot/3d-joint/stator_v3.glb');
  const statorRotor = useLoader(GLTFLoader, 'stator_rotor_v4.glb');
  const stator = useLoader(GLTFLoader, 'stator_v3.glb');

  useEffect(() => {
    window.onkeydown = (e) => {
      const kcr = keyControlRegistrations.find(k => k.key === e.key);
      kcr?.action();
    }
  }, [ keyControlRegistrations ]);

  return <RotorStatorContext.Provider value={{ statorRotor, stator }}>
    <KCRContext.Provider value={{ keyControlRegistrations, setKeyControlRegistrations }} >
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <AngleRepresentationContext.Provider value={{ angleRepresentation, setAngleRepresentation }}>
          <InputTypeContext.Provider value={{ inputType, setInputType }}>
            <RobotContext.Provider value={{ robot, setRobot }}>
              <JacobianCodeContext.Provider value={{
                finalJacobianData, setFinalJacobianData,
                jacobianCode, setJacobianCode,
                allVs, setAllVs,
                allOmegas, setAllOmegas,
                jacobianSection2DArray, setJacobianSection2DArray,
                evaluatedJac, setEvaluatedJac,
                invertedJac, setInvertedJac
              }}>
                <Wrapper />
              </JacobianCodeContext.Provider>
            </RobotContext.Provider>
          </InputTypeContext.Provider>
        </AngleRepresentationContext.Provider>
      </MantineProvider>
    </KCRContext.Provider>
  </RotorStatorContext.Provider>
}

export default App
