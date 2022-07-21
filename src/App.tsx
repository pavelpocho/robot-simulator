import './App.css'
import { Layer, Stage } from 'react-konva'
import { TwoDJoint } from './components/robot/2d-joint'
import { TwoDLink } from './components/robot/2d-link'
import { TwoDBase } from './components/robot/2d-base'
import math, { atan2, cross, e, MathNumericType, matrix, multiply, transpose } from 'mathjs'
import { TwoDPrismaticJoint } from './components/robot/2d-prismatic-joint'
import { EndEffector } from './components/robot/end-effector'
import { useKinematicInfo } from './utils/useKinematicInfo'
import { PositionControlUI } from './components/ui/position-control'
import { VelocityControlUI } from './components/ui/velocity-control'
import { useEffect, useState } from 'react'
import vector from './utils/vector'
import { JoystickUI } from './components/ui/joystick'
import { Context } from './utils/inputTypeContext'
import React from 'react'
import { InputType, InputTypeUI } from './components/ui/input-type'
import { AccelerationControlUI } from './components/ui/acceleration-control'

interface MouseCoords {
  x: number,
  y: number,
  prevX: number,
  prevY: number
}

function App() {

  const kinematicsInfo = useKinematicInfo();

  const {
    kinematics, robotType, robot
  } = kinematicsInfo;

  const [ trackMouse, setTrackMouse ] = useState<boolean>(false);
  const [ mouseCoords, setMouseCoords ] = useState<MouseCoords | null>(null);

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

  

  return (
    <div onKeyDown={(e) => {
    }} tabIndex={0} style={{
      padding: '20px'
    }}>
      <Stage width={window.innerWidth - 540} height={window.innerHeight - 40} onMouseDown={() => {
        setTrackMouse(true);
      }} onMouseUp={() => {
        setTrackMouse(false);
        setMouseCoords(null);
      }} onMouseMove={(e) => {
        if (trackMouse) {
          setMouseCoords(mc => ({ x: e.evt.pageX, y: e.evt.pageY, prevX: mc?.x ?? 0, prevY: mc?.y ?? 0 }));
        }
      }}>
        <Layer>
          <TwoDBase x={0} y={0} />
          { kinematics.map((kin, i) => {
            if (i === kinematics.length - 1) {
              return null;
            }
            if (robotType.jointTypes[i] == 'P') {
              return <TwoDPrismaticJoint rotationRad={kin ? atan2(
                (kin.toArray()[1] as MathNumericType[])[0] as number,
                (kin.toArray()[0] as MathNumericType[])[0] as number
              ) : 0} length={robot?.getJointValues()[i] ?? 0} key={i} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} />
            }
            else {
              return <TwoDJoint key={i} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} />
            }
          }) }
          <TwoDLink key={-1} length={robot?.getLinkLengths()[0] ?? 0} x={0} y={0} rotationRad={0} />
          { kinematics.map((kin, i) => {
            if (i === kinematics.length - 1) {
              return <EndEffector key={i} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} rotationRad={kin ? atan2(
                (kin.toArray()[1] as MathNumericType[])[0] as number,
                (kin.toArray()[0] as MathNumericType[])[0] as number
              ) : 0} />
            }
            return <TwoDLink key={i} length={robot?.getLinkLengths()[i + 1] ?? 0} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} rotationRad={kin ? atan2(
              (kin.toArray()[1] as MathNumericType[])[0] as number,
              (kin.toArray()[0] as MathNumericType[])[0] as number
            ) : 0} />
          }) }
        </Layer>
      </Stage>
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        width: '500px',
        zIndex: 3
      }}>
        <InputTypeUI />
        <h2>Kinematics</h2>
        <PositionControlUI {...kinematicsInfo} />
        <VelocityControlUI {...kinematicsInfo} />
        <JoystickUI {...kinematicsInfo} />
        <JoystickUI {...kinematicsInfo} angular={true} />
        <h2>Dynamics</h2>
        <AccelerationControlUI {...kinematicsInfo} />
        {/*
          #0: Enter parameters (gravity, friction, etc.)
          #1: Enter joint accelerations and get necessarry torques
          #2: Enter joint torques and get joint acceleration
          #3: Enter cartesian acceleration and get (cartesian?) forces / torques
          #4: Enter (cartesian?) forces / torques and get cartesian acceleration
        */}
        <h2>Trajectory planning</h2>
        {/*
          #1: Cubic / quintic functions
          #2: Spliced linear with blends
        */}
      </div>
    </div>
  )
}

export default App
