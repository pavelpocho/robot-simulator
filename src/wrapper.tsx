import './App.css'
import { useEffect, useState } from 'react'
import ThreeDCanvas from './components/canvases/3d-canvas'
import { UIWrapper } from './components/ui-wrapper/ui-wrapper'
import { Robot, useRobotContext } from './utils/contexts/RobotContext'
import { useVelocityLoop } from './utils/loops/velocity-loop'
import { useJacobianCodeContext } from './utils/contexts/JacobianCodeContext'
import { compile, e, inv, matrix, multiply, transpose } from 'mathjs'
import nerdamer from 'nerdamer'
import { getInverseKinematics, getInverseKinematicsFP, getNumbericTMsFrom0ToN, getPiepersInverseKinematics, isPieper, useNumbericTMsFrom0ToN } from './utils/hooks/robotHooks'
import { getZYXCardanoAngles, getXYZFixedAngles, getZYZEulerAngles, getEqAnAx, getEulerParams } from './utils/angle-utils'
import { PlaneController } from './components/ui/plane-controller'
import { useInputTypeContext } from './utils/contexts/InputTypeContext'
import { InputType } from './components/ui/input-type'
import vector from './utils/vector'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { pinv } from 'mathjs';

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

export enum AR {
  XYZFixed,
  ZYXEuler,
  ZYZEuler,
  EqAnAx,
  EulerParams
}

const getRidOfFractions = (expression: string) => {
  return expression.replace(/([0-9]|-)+\/[0-9]+/g, s => {
    const nums = s.split('/').map(n => parseFloat(n));
    return (nums[0] / nums[1]).toFixed(3).toString();
  });
}

export interface FinalJacobianData {
  completeJacobian: string,
  doubledRotationMatrices: string[],
  downToZeroRotMat: string,
  finalJacobian: string
}

const Wrapper = () => {

  const [ screenSize, setScreenSize ] = useState<ScreenSize>({ x: Math.max(window.innerWidth - 820, 300), y: window.innerHeight });
  window.onresize = () => {
    setScreenSize({ x: Math.max(window.innerWidth - 820, 300), y: window.innerHeight });
  }

  const { robot, setRobot } = useRobotContext();
  const { jacobianCode, setJacobianCode, setAllVs, setAllOmegas, setJacobianSection2DArray, setFinalJacobianData, setEvaluatedJac, setInvertedJac } = useJacobianCodeContext();
  const { inputType } = useInputTypeContext();

  const [ int, setInt ] = useState<NodeJS.Timer | null>(null);
  
  const [ jls, setJls ] = useState<string>('0%');
  const transformMatrices = useNumbericTMsFrom0ToN();
  useVelocityLoop();

  const recalculateJacobian = () => {
    setJacobianCode(null);
    setJls('5%');
    const jacobian = [...Array(6).keys()].map(_ => [...Array(robot.type.length - 1).keys()].map(_ => '0'));
    const done = Array(6).fill(false);
    const worker = new Worker(new URL('./utils/worker.ts', import.meta.url), { type: 'module' });
    const finalWorker = new Worker(new URL('./utils/finalWorker.ts', import.meta.url), { type: 'module' });
    const jacSectionWorkers = [...Array(6).keys()].map(_ => new Worker(new URL('./utils/jacSectionWorker.ts', import.meta.url), { type: 'module' }));
    console.log('created workers');
    worker.onmessage = (ev: MessageEvent<{ all_vs: string, all_omegas: string }>) => {
      console.log('worked onmessage in main');
      // The jacobian has n columns where n is the number of joints
      // and m rows where m is the degrees of freedom there are
      worker.terminate();
      for (let i = 0; i < jacobian.length; i++) {
        setJls('10%');
        const vs = ev.data.all_vs.split(';');
        const omegas = ev.data.all_omegas.split(';');
        setAllVs(vs.map(v => getRidOfFractions(v)));
        setAllOmegas(omegas.map(omega => getRidOfFractions(omega)));
        jacSectionWorkers[i].postMessage({
          v_final: vs[vs.length - 1], omega_final: omegas[omegas.length - 1], i, robotType: robot.type
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
          setJacobianSection2DArray(jacobian.map(i => i.map(j => getRidOfFractions(j))));
          finalWorker.postMessage({
            robot, jacobian
          });
        }
      }
    })
    finalWorker.onmessage = (ev: MessageEvent<FinalJacobianData>) => {
      setJls('100%');
      setFinalJacobianData(ev.data);
      setJacobianCode(compile(ev.data.finalJacobian));
    }
    worker.postMessage(robot);
  };

  // How forward kinematics parameters affect others
  // Changing Joint Position -> 1. Update DH table
  // Change DH Table -> 1. Update Cartesian Positions
  // Changing Cartesian Position -> Cannot, IK isn't doable
  // Doing it in stages like below is not efficient, 
  // but it is logical, which is more important here

  const runInverseKinematics = (r: Robot) => {
    const anglesFP = getInverseKinematicsFP(r);
    return anglesFP;
  }

  const updateDHTable = (r: Robot) => {
    const dhTable = r.dhTable.map(d => d);
    r.jointPositions.forEach((jp, i) => {
      if (r.type[i] === 'R') {
        dhTable[i].theta_i = jp;
      }
      else if (robot.type[i] === 'P') {
        dhTable[i].d_i = jp;
      }
    });
    return dhTable;
  }

  const refreshSimulation = (r: Robot) => {
    // Update the Cartesian position
    // need a system for angle systems
    const arr = getNumbericTMsFrom0ToN(r)[transformMatrices.length - 1]?.toArray();
    if (arr === undefined) return;

    // Position
    const x = (arr[0] as number[])[3];
    const y = (arr[1] as number[])[3];
    const z = (arr[2] as number[])[3];

    // Rotation in the correct orientation

    const ar = r.angleRepresentation;

    const numbers = ar === AR.XYZFixed ? (
      getXYZFixedAngles(arr)
    ) : ar === AR.ZYXEuler ? (
      getZYXCardanoAngles(arr)
    ) : ar === AR.ZYZEuler ? (
      getZYZEulerAngles(arr)
    ) : ar === AR.EqAnAx ? (
      getEqAnAx(arr)
    ) : ar === AR.EulerParams ? (
      getEulerParams(arr)
    ) : null

    if (numbers == null) return;

    const a = numbers[0] ?? 0;
    const b = numbers[1] ?? 0;
    const c = numbers[2] ?? 0;
    const d = numbers[3] ?? 0;

    const fr = (num: number) => Math.round(num * 100000) / 100000;

    return [ fr(x), fr(y), fr(z), fr(a), fr(b), fr(c), fr(d) ];
  }

  useEffect(() => {
    const linear3R = robot.type === 'RRRE';
    if ((!linear3R && !isPieper(robot)) || !robot.ikUpdate) return;
    setRobot(r => {
      const jointPositions = isPieper(r) ? getPiepersInverseKinematics(r) : runInverseKinematics(r);
      if (jointPositions == undefined || jointPositions.find(j => isNaN(j)) != undefined) return r;
      r = { ...r, jointPositions, ikUpdate: false };

      const dhTable = updateDHTable(r);
      r = { ...r, dhTable }

      const cartesianEEPositions = refreshSimulation(r);
      if (cartesianEEPositions == undefined) return r;
      r = { ...r, cartesianEEPositions }

      return r;
    });
  }, [ robot.ikUpdate, robot.cartesianEEPositions ]);

  useEffect(() => {
    if (!robot.fkUpdate) return;
    setRobot(r => {
      const dhTable = updateDHTable(r);
      r = { ...r, dhTable, fkUpdate: false }

      const cartesianEEPositions = refreshSimulation(r);
      if (cartesianEEPositions == undefined) return r;
      r = { ...r, cartesianEEPositions }

      const pieperTest = getPiepersInverseKinematics(r);
      return r;
    });
  }, [ robot.fkUpdate, robot.jointPositions ]);

  const jointVelUpdate = (r: Robot) => {
    const pos = r.jointPositions.map((jp, i) => jp + 0.01 * r.jointVelocities[i]);
    r = { ...r, jointPositions: pos };

    const dhTable = updateDHTable(r);
    r = { ...r, dhTable };

    const cartesianEEPositions = refreshSimulation(r);
    if (cartesianEEPositions == undefined) return r;
    r = { ...r, cartesianEEPositions };

    const vars = {};
    r.dhTable.forEach((d, i) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vars[`t${i+1}`] = d.theta_i;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vars[`d${i+1}`] = d.d_i;
    });

    // console.log('1');
    // console.log(jacobianCode?.evaluate(vars));
    // console.log('2');
    // console.log(vector(r.jointVelocities));

    const evalJac = jacobianCode?.evaluate(vars);
    setEvaluatedJac(evalJac);
    const cartesianEEVelocities = multiply(evalJac, vector(r.jointVelocities));
    r = { ...r, cartesianEEVelocities: cartesianEEVelocities.toArray() };

    return r;
  }

  const cartVelUpdate = (r: Robot) => {
    const vars = {};
    r.dhTable.forEach((d, i) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vars[`t${i+1}`] = d.theta_i;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vars[`d${i+1}`] = d.d_i;
    });
    const evalJac = jacobianCode?.evaluate(vars);
    setEvaluatedJac(evalJac);
    const invJac = pinv(evalJac);
    setInvertedJac(invJac);

    const jointVelocities = multiply(invJac, vector(r.cartesianEEVelocities)).toArray();
    r = { ...r, jointVelocities };

    const pos = r.jointPositions.map((jp, i) => jp + 0.01 * r.jointVelocities[i]);
    r = { ...r, jointPositions: pos };

    const dhTable = updateDHTable(r);
    r = { ...r, dhTable };

    const cartesianEEPositions = refreshSimulation(r);
    if (cartesianEEPositions == undefined) return r;
    r = { ...r, cartesianEEPositions };

    return r;
  }

  useEffect(() => {
    if (inputType === InputType.JointVel) {
      setRobot(r => jointVelUpdate(r));
      setInt(setInterval(() => {
        setRobot(r => {
          if (r.jointPositions.every(c => c == 0)) return r;
          return jointVelUpdate(r);
        });
      }, 10));
    }
    else if (inputType === InputType.CartVel) {
      setRobot(r => cartVelUpdate(r));
      setInt(setInterval(() => {
        setRobot(r => {
          if (r.cartesianEEVelocities.every(c => c == 0)) return r;
          return cartVelUpdate(r);
        })
      }, 10));
    }
    else {
      if (int) clearInterval(int);
    }
  }, [inputType]);

  return (
    <div tabIndex={0} style={{}}>
      <div style={{ position: 'fixed', right: '0px', top: '0px', width: screenSize.x, height: screenSize.y, boxShadow: 'inset 0px 0px 30px -15px #999', overflow: 'hidden', boxSizing: 'border-box' }}>
        <ThreeDCanvas />
      </div>
      <div style={{
        height: '100vh',
        width: `${Math.min(window.innerWidth - screenSize.x)}px`,
        overflowX: 'hidden',
        overflowY: 'scroll',
        position: 'relative'
      }}>
        <UIWrapper recalculateJacobian={recalculateJacobian} jls={jls} />
      </div>
    </div>
  )
}

export default Wrapper
