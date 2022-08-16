import './App.css'
import { Layer, Stage } from 'react-konva'
import { TwoDJoint } from './components/robot/2d-joint'
import { TwoDLink } from './components/robot/2d-link'
import { TwoDBase } from './components/robot/2d-base'
import math, { atan2, compile, cross, e, MathNumericType, matrix, multiply, transpose } from 'mathjs'
import { TwoDPrismaticJoint } from './components/robot/2d-prismatic-joint'
import { EndEffector } from './components/robot/end-effector'
import { useKinematicInfo } from './utils/useKinematicInfo'
import { PositionControlUI } from './components/ui/position-control'
import { VelocityControlUI } from './components/ui/velocity-control'
import { useEffect, useState } from 'react'
import vector from './utils/vector'
import { JoystickUI } from './components/ui/joystick'
import { Context, useInputTypeContext } from './utils/inputTypeContext'
import React from 'react'
import { InputType, InputTypeUI } from './components/ui/input-type'
import { TrajectoryControlUI } from './components/ui/trajectory-control'
import { AccelerationControlUI } from './components/ui/acceleration-control'
import { RobotTypeUI } from './components/ui/robot-type'
import { MathComponent } from 'mathjax-react'
import TwoDCanvas from './components/canvases/2d-canvas'
import ThreeDCanvas from './components/canvases/3d-canvas'
import { DHParametersUI } from './components/ui/dh-parameters'

export interface MouseCoords {
  x: number,
  y: number,
  prevX: number,
  prevY: number
}

export interface ScreenSize {
  x: number,
  y: number
}

function App() {

  const kinematicsInfo = useKinematicInfo();

  const {
    kinematics, robotType, robot
  } = kinematicsInfo;

  const [ trackMouse, setTrackMouse ] = useState<boolean>(false);
  const [ mouseCoords, setMouseCoords ] = useState<MouseCoords | null>(null);
  const [ screenSize, setScreenSize ] = useState<ScreenSize>({ x: window.innerWidth - 680, y: window.innerHeight });

  useEffect(() => {
    if (!mouseCoords || mouseCoords?.prevX == 0 || mouseCoords?.prevY == 0) {
      return;
    }
    kinematicsInfo.setX(x => x + (mouseCoords.x - mouseCoords.prevX));
    kinematicsInfo.setY(y => y + (mouseCoords.y - mouseCoords.prevY));
    // kinematicsInfo.setA(atan2(kinematicsInfo.y + (mouseCoords.y - mouseCoords.prevY) + 50, kinematicsInfo.x + (mouseCoords.x - mouseCoords.prevX)) / Math.PI * 180);
    kinematicsInfo.setApplyInvKin(true);
  }, [mouseCoords]);

  useEffect(() => {
    kinematicsInfo.setApplyFwdKin(true);
  }, []);

  window.onresize = () => {
    setScreenSize({ x: window.innerWidth - 680, y: window.innerHeight });
  }

  const c = useInputTypeContext();

  return (
    <div onKeyDown={(e) => {
    }} tabIndex={0} style={{}}>
      {/* <TwoDCanvas 
        screenSize={screenSize} 
        trackMouse={trackMouse} 
        setTrackMouse={setTrackMouse} 
        c={c} 
        setMouseCoords={setMouseCoords} 
        kinematics={kinematics} 
        robotType={robotType} 
        robot={robot}
      /> */}
      <div style={{ position: 'fixed', width: screenSize.x - 24, height: screenSize.y - 24 }}>
        <ThreeDCanvas {...kinematicsInfo} />
      </div>
      <div id={'control-wrapper'}>
        <h1 id='main-title'>2D Robotic Manipulator simulator</h1>
        <InputTypeUI />
        <h3 className='section-title'>2. Choose robot type</h3>
        <DHParametersUI {...kinematicsInfo} />
        <RobotTypeUI {...kinematicsInfo} />
        {/* <button onClick={() => {
          const startSpec = new Date();
          console.log(robot?.getJacobian([30, 30, 30], [0, 100, 100, 100]));
          const endSpec = new Date();
          console.log("Specific:", (endSpec.getTime() - startSpec.getTime()));
          const code = compile('matrix([[(L1*cos(theta_1)*sin(theta_2)+L1*cos(theta_2)*sin(theta_1)+L2*sin(theta_2))*cos(90)-(-L1*sin(theta_1)*sin(theta_2)+L1*cos(theta_1)*cos(theta_2)+L2*cos(theta_2)+L3)*sin(90),(-L1*sin(theta_1)*sin(theta_2)+L1*cos(theta_1)*cos(theta_2)+L2*cos(theta_2)+L3)*cos(90)+(L1*cos(theta_1)*sin(theta_2)+L1*cos(theta_2)*sin(theta_1)+L2*sin(theta_2))*sin(90),1],[-(L2*cos(theta_2)+L3)*sin(90)+L2*cos(90)*sin(theta_2),(L2*cos(theta_2)+L3)*cos(90)+L2*sin(90)*sin(theta_2),1],[-L3*sin(90),L3*cos(90),1]])');
          const startGen = new Date();
          console.log(robot?.getGeneralJacobian([30, 30, 30], [0, 100, 100, 100], code));
          const endGen = new Date();
          console.log("General:", (endGen.getTime() - startGen.getTime()));
        }}>Jacobians</button> */}
        <h3 className='section-title'>3. Choose simulation parameters</h3>
        <h4>Kinematics</h4>
        <PositionControlUI {...kinematicsInfo} />
        <VelocityControlUI {...kinematicsInfo} />
        <JoystickUI {...kinematicsInfo} />
        <JoystickUI {...kinematicsInfo} angular={true} />
        { c.inputType == InputType.Torques && <>
          <h4>Dynamics</h4>
          <AccelerationControlUI {...kinematicsInfo} />
        </> }
        {/*
          #0: Enter parameters (gravity, friction, etc.)
          #1: Enter joint accelerations and get necessarry torques
          #2: Enter joint torques and get joint acceleration
          #3: Enter cartesian acceleration and get (cartesian?) forces / torques
          #4: Enter (cartesian?) forces / torques and get cartesian acceleration
        */}
        { c.inputType == InputType.Trajectory && <>
          <h4>Trajectory planning</h4>
          <TrajectoryControlUI {...kinematicsInfo} />
        </> }
        {/*
          #1: Cubic / quintic functions
          #2: Spliced linear with blends
        */}
        <h3 className='section-title'>4. See the simulation details</h3>
        { c.inputType === InputType.FwdKin && (<>
          {/* <MathComponent tex={String.raw`A = \left[ \begin{array}{ccc} 1  & -1 & 1 \\\ -1 &  1 & -1 \\\ 0  &  1 &  2 \end{array} \right]`} /> */}
          <MathComponent tex={String.raw`{_i^{i-1}}T=\left[ \begin{array}{ccc}c\theta_i & -s\theta_i & 0 & a_{i-1} \\ s\theta_ic\alpha_{i-1} & c\theta_ic\alpha_{i-1} & -s\alpha_{i-1} & -s\alpha_{i-1}d_i \\ s\theta_is\alpha_{i-1} & c\theta_is\alpha_{i-1} & c\alpha_{i-1} & c\alpha_{i-1}d_i \\ 0 & 0 & 0 & 1\end{array} \right]`} />
          { robot?.linkParametersArray.map((lp, i) => {
            return <MathComponent key={i} tex={lp.getMathJaxTMSubstituted()} />
          }) }
          { robot?.linkParametersArray.map((lp, i) => {
            return <MathComponent key={i} tex={lp.getMathJaxTMSolved()} />
          }) }
          { robot && [...Array(robot?.numOfJoints).keys()].map(i => {
            const mat = robot?.forwardKinematics(i+1);
            const str = String.raw`{_${i+2}^{${0}}}T=\left[ \begin{array}{ccc}
              ${((mat?.toArray()[0] as number[])[0]as number).toFixed(2)} & ${((mat?.toArray()[0] as number[])[1]as number).toFixed(2)} & ${((mat?.toArray()[0] as number[])[2]as number).toFixed(2)} & ${((mat?.toArray()[0] as number[])[3]as number).toFixed(2)} \\ 
              ${((mat?.toArray()[1] as number[])[0]as number).toFixed(2)} & ${((mat?.toArray()[1] as number[])[1]as number).toFixed(2)} & ${((mat?.toArray()[1] as number[])[2]as number).toFixed(2)} & ${((mat?.toArray()[1] as number[])[3]as number).toFixed(2)} \\ 
              ${((mat?.toArray()[2] as number[])[0]as number).toFixed(2)} & ${((mat?.toArray()[2] as number[])[1]as number).toFixed(2)} & ${((mat?.toArray()[2] as number[])[2]as number).toFixed(2)} & ${((mat?.toArray()[2] as number[])[3]as number).toFixed(2)} \\
              0 & 0 & 0 & 1\end{array} \right]`
            return <MathComponent key={i} tex={str} />
          })}
        </>) }
      </div>
    </div>
  )
}

export default App
