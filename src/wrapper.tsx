import './App.css'
import { useEffect, useState } from 'react'
import ThreeDCanvas from './components/canvases/3d-canvas'
import { UIWrapper } from './components/ui-wrapper/ui-wrapper'
import { useRobotContext } from './utils/contexts/RobotContext'
import { useVelocityLoop } from './utils/loops/velocity-loop'
import { useJacobianCodeContext } from './utils/contexts/JacobianCodeContext'
import { compile } from 'mathjs'
import nerdamer from 'nerdamer'
import { useNumbericTMsFrom0ToN } from './utils/hooks/robotHooks'
import { useAngleRepresentationContext } from './utils/contexts/AngleRepresentationContext'
import { AR } from './components/ui/position-control'
import { getZYXEulerAngles, getXYZFixedAngles, getZYZEulerAngles, getEqAnAx } from './utils/angle-utils'

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
  const { setJacobianCode } = useJacobianCodeContext();
  const { angleRepresentation } = useAngleRepresentationContext();
  
  const [ jls, setJls ] = useState<string>('0%');
  const transformMatrices = useNumbericTMsFrom0ToN();
  useVelocityLoop();

  const recalculateJacobian = () => {
    setJacobianCode(null);
    const jacobian = [...Array(6).keys()].map(_ => [...Array(robot.type.length - 1).keys()].map(_ => '0'));
    const done = Array(6).fill(false);
    const worker = new Worker(new URL('./utils/worker.ts', import.meta.url), { type: 'module' });
    const finalWorker = new Worker(new URL('./utils/finalWorker.ts', import.meta.url), { type: 'module' });
    const jacSectionWorkers = [...Array(6).keys()].map(_ => new Worker(new URL('./utils/jacSectionWorker.ts', import.meta.url), { type: 'module' }));
    worker.onmessage = (ev: MessageEvent<{ v_final: string, omega_final: string }>) => {
      // The jacobian has n columns where n is the number of joints
      // and m rows where m is the degrees of freedom there are
      worker.terminate();
      for (let i = 0; i < jacobian.length; i++) {
        setJls('10%');
        jacSectionWorkers[i].postMessage({
          v_final: ev.data.v_final, omega_final: ev.data.omega_final, i, robotType: robot.type
        });
      }
    };
    jacSectionWorkers.forEach(jsw => {
      jsw.onmessage = (ev: MessageEvent<{ i: number, jacobianSection: string[] }>) => {
        jacobian[ev.data.i] = ev.data.jacobianSection;
        done[ev.data.i] = true;
        worker.terminate();
        setJls((done.filter(d => d).length / done.length * 80 + 10).toString() + '%');
        if (!done.includes(false)) {
          finalWorker.postMessage({
            robot, jacobian
          });
        }
      }
    })
    finalWorker.onmessage = (ev: MessageEvent<string>) => {
      setJls('100%');
      setJacobianCode(compile(ev.data));
    }
    worker.postMessage(robot);
  };

  // How forward kinematics parameters affect others
  // Changing Joint Position -> 1. Update DH table
  // Change DH Table -> 1. Update Cartesian Positions
  // Changing Cartesian Position -> Cannot, IK isn't doable
  // Doing it in stages like below is not efficient, 
  // but it is logical, which is more important here

  useEffect(() => {
    // Update the Cartesian position
    // need a system for angle systems
    const arr = transformMatrices[transformMatrices.length - 1]?.toArray();
    if (arr === undefined) return;

    // Position
    const x = (arr[0] as number[])[3];
    const y = (arr[1] as number[])[3];
    const z = (arr[2] as number[])[3];

    // Rotation in the correct orientation

    const numbers = angleRepresentation === AR.XYZFixed ? (
      getXYZFixedAngles(arr)
    ) : angleRepresentation === AR.ZYXEuler ? (
      getZYXEulerAngles(arr)
    ) : angleRepresentation === AR.ZYZEuler ? (
      getZYZEulerAngles(arr)
    ) : angleRepresentation === AR.EqAnAx ? (
      getEqAnAx(arr)
    ) : null

    if (numbers == null) return;

    const a = numbers[0] ?? 0;
    const b = numbers[1] ?? 0;
    const c = numbers[2] ?? 0;
    const d = numbers[3] ?? 0;

    // Execute updates
    setRobot(r => ({ ...r, cartesianEEPositions: [ x, y, z, a, b, c, d ] }));
  }, [robot.dhTable, angleRepresentation]);

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

    // Execute updates
    setRobot(r => ({ ...r, dhTable }));
  }, [ robot.jointPositions ]);

  return (
    <div tabIndex={0} style={{}}>
      <div style={{ position: 'fixed', width: screenSize.x - 24, height: screenSize.y - 24 }}>
        <ThreeDCanvas />
      </div>
      <button style={{ zIndex: 1000, position: 'fixed' }} onClick={() => { recalculateJacobian() }}>Recalc jacobian</button>
      <UIWrapper />
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: '10' }}>
        <p>Jacobian loading status</p>
        <p>{jls}</p>
      </div>
    </div>
  )
}

export default Wrapper
