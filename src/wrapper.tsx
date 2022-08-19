import './App.css'
import { useEffect, useState } from 'react'
import ThreeDCanvas from './components/canvases/3d-canvas'
import { UIWrapper } from './components/ui-wrapper/ui-wrapper'
import { useCompiledJacobian } from './utils/hooks/robotHooks'
import { useRobotContext } from './utils/contexts/RobotContext'
import { useVelocityLoop } from './utils/loops/velocity-loop'

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

const Wrapper = () => {

  const [ screenSize, setScreenSize ] = useState<ScreenSize>({ x: window.innerWidth - 680, y: window.innerHeight });
  window.onresize = () => {
    setScreenSize({ x: window.innerWidth - 680, y: window.innerHeight });
  }

  const { robot, setRobot } = useRobotContext();

  useVelocityLoop();

  useEffect(() => {
    console.log("Robot type changed, should recalculate models");
  }, [ robot.type ]);

  useEffect(() => {
    // Update the DH table
    const dhTable = robot.dhTable.map(d => d);
    robot.jointPositions.forEach((jp, i) => {
      if (robot.type[i] === 'R') {
        dhTable[i].theta_i = jp;
      }
      else if (robot.type[i] === 'P') {
        dhTable[i].d_i = jp;
      }
    });

    // Update the Cartesian position
    // need a system for angle systems

    // Execute updates
    setRobot(r => ({ ...r, dhTable }));
  }, [ robot.jointPositions ]);

  return (
    <div tabIndex={0} style={{}}>
      <div style={{ position: 'fixed', width: screenSize.x - 24, height: screenSize.y - 24 }}>
        <ThreeDCanvas />
      </div>
      <UIWrapper />
    </div>
  )
}

export default Wrapper
