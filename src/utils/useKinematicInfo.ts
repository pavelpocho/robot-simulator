import math, { atan2, MathNumericType, matrix, multiply, pi } from "mathjs";
import nerdamer from "nerdamer";
import React, { useCallback, useContext, useEffect } from "react";
import { useState } from "react";
import { Context } from "urql";
import { InputType } from "../components/ui/input-type";
import TwoDRobot, { P_2D_Robot_Type, RPR_2D_Robot_Type, RRPR_2D_Robot_Type, RRR_2D_Robot_Type, RR_2D_Robot_Type, R_2D_Robot_Type } from "../robotics/dh-translator";
import { useInputTypeContext } from "./inputTypeContext";
import { useInterval } from "./useInterval";
import vector from "./vector";

interface AngleInfo {
  doneSpeedPart: number,
  i: number,
  prevAcceleration: number,
  secondPrevAcceleration: number,
  newSpeed: number
}

export interface RobotLinkLengths {
  values: number[]
}

interface QuinticAObject { 
  a_0: number, a_1: number, a_2: number, a_3: number, a_4: number, a_5: number
}

interface CubicAObject { 
  a_0: number, a_1: number, a_2: number, a_3: number
}

export interface AccelCalcData {
  t: number[], td: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number
}

export enum TrajectoryInputType {
  JointSpace = 0,
  CartesianSpace = 1
}

export interface JointFriction {
  staticFriction: number,
  dynamicFriction: number,
  viscousFriction: number
}

interface ParameterQueue {
  angle1Positions: number[];
  angle1Velocities: number[];
  angle1Accelerations: number[];
  angle2Positions: number[];
  angle2Velocities: number[];
  angle2Accelerations: number[];
}

export interface DHTableRow {
  a_imin1: number,
  alpha_imin1: number,
  d_i: number,
  theta_i: number
}

export interface DHTable {
  params: DHTableRow[],
  updateCounter: number
}

export const useKinematicInfo = () => {

  // const robotType = RRR_2D_Robot_Type;
  // const jointValues = [0, 0, 0];
  // const linkLengths = [0, 100, 100, 50];

  // const robotType = R_2D_Robot_Type;
  // const jointValues = [0];
  // const linkLengths = [0, 100];

  // const robotType = RRR_2D_Robot_Type;
  // const jointValues = [0, 0, 0];
  // const linkLengths = [0, 100, 80, 40];

  const [ robotType, setRobotType ] = useState<string>('RRR');
  const [ linkLengths, setLinkLengths ] = useState<RobotLinkLengths>({ values: Array(robotType.length + 1).fill(100).map((a, i) => i == 0 ? 0 : a) });
  const [ applyRobotTypeChange, setApplyRobotTypeChange ] = useState<boolean>(true);
  const [ applyLinkLengthChange, setApplyLinkLengthChange ] = useState<boolean>(false);
  const [ dhParameters, setDhParameters ] = useState<DHTable>({ params: [
    { a_imin1: 0, alpha_imin1: 0, d_i: 0, theta_i: 0 },
    { a_imin1: 0, alpha_imin1: 0, d_i: 0, theta_i: 0 },
    { a_imin1: 0, alpha_imin1: 0, d_i: 0, theta_i: 0 },
    { a_imin1: 0, alpha_imin1: 0, d_i: 0, theta_i: 0 },
    { a_imin1: 0, alpha_imin1: 0, d_i: 0, theta_i: 0 }
  ], updateCounter: 0});
  const [ applyDhChange, setApplyDhChange ] = useState<boolean>(false);

  const [robot, setRobot] = useState<TwoDRobot | null>(null);
  const [angle1, setAngle1] = useState<number>(30);
  const [angle2, setAngle2] = useState<number>(30);
  const [angle3, setAngle3] = useState<number>(30);
  const [ jointPositions, setJointPositions ] = useState<number[]>([...Array(robotType.length).keys()].fill(0));
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [a, setA] = useState<number>(0);
  const [applyInvKin, setApplyInvKin] = useState<boolean>(false);
  const [applyFwdKin, setApplyFwdKin] = useState<boolean>(false);
  const [kinematics, setKinematics] = useState<(math.Matrix | null | undefined)[]>([]);

  const [angle1Dot, setAngle1Dot] = useState<number>(0);
  const [angle2Dot, setAngle2Dot] = useState<number>(0);
  const [angle3Dot, setAngle3Dot] = useState<number>(0);
  const [xDot, setXDot] = useState<number>(0);
  const [yDot, setYDot] = useState<number>(0);
  const [aDot, setADot] = useState<number>(0);
  const [applyJointVelocities, setApplyJointVelocities] = useState<boolean>(false);
  const [applyCartesianVelocities, setApplyCartesianVelocities] = useState<boolean>(false);

  const [trajectoryInputType, setTrajectoryInputType] = useState<TrajectoryInputType>(TrajectoryInputType.JointSpace);
  const [trajectoryJoint1Values, setTrajectoryJoint1Values] = useState<number[]>([]);
  const [trajectoryJoint2Values, setTrajectoryJoint2Values] = useState<number[]>([]);
  const [trajectoryJoint3Values, setTrajectoryJoint3Values] = useState<number[]>([]);
  const [trajectoryEECartXValues, setTrajectoryEECartXValues] = useState<number[]>([]);
  const [trajectoryEECartYValues, setTrajectoryEECartYValues] = useState<number[]>([]);
  const [trajectoryEECartZValues, setTrajectoryEECartZValues] = useState<number[]>([]);

  const [runCubicTrajectory, setRunCubicTrajectory] = useState<boolean>(false);
  const [cubicTrajectoryRunning, setCubicTrajectoryRunning] = useState<boolean>(false);
  const [cubicAObjects, setCubicAObjects] = useState<CubicAObject[]>([]);

  const [runQuinticTrajectory, setRunQuinticTrajectory] = useState<boolean>(false);
  const [quinticTrajectoryRunning, setQuinticTrajectoryRunning] = useState<boolean>(false);
  const [quinticAObjects, setQuinticAObjects] = useState<QuinticAObject[]>([]);

  const [ torques, setTorques ] = useState<number[]>([0, 0, 0]);
  const [ linkWidths, setLinkWidths ] = useState<number[]>([0.1, 0.1, 0.1]);
  const [ linkMasses, setLinkMasses ] = useState<number[]>([1, 1, 1]);
  const [ jointFrictions, setJointFrictions ] = useState<JointFriction[]>([
    { staticFriction: 2.6, dynamicFriction: 1.9, viscousFriction: 3 },
    { staticFriction: 2.6, dynamicFriction: 1.9, viscousFriction: 3 },
    { staticFriction: 2.6, dynamicFriction: 1.9, viscousFriction: 3 }
  ]);
  const [ gravity, setGravity ] = useState<number>(-9.81);
  const [ eeForces, setEeForces ] = useState<number[]>([0, 0, 0]);
  const [ positionsToHold, setPositionsToHold ] = useState<number[]>([90, 0, 0]);

  const [ time, setTime ] = useState<number>(0);
  const [ lastSimTime, setLastSimTime ] = useState<number>(new Date().getTime());

  const c = useInputTypeContext();

  // Change robot using input DH parameters -----------------------------------

  useEffect(() => {
    if (applyDhChange) {
      robot?.setDhParameters(dhParameters.params, jointPositions, robotType);
      setApplyDhChange(false);
    }
    if (c.inputType == InputType.FwdKin) {
      if (applyFwdKin) {
        // robot?.setJointValues(createJointValues(...jointPositions));
        let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
        setKinematics(kinem);
        setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setA(atan2(
          (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
          (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
        ) / Math.PI * 180);
        setApplyFwdKin(false);
      }
    }
  }, [ applyDhChange, applyRobotTypeChange, applyFwdKin ])

  // Initialization -----------------------------------------------------------

  useEffect(() => {
    if (applyRobotTypeChange) {
      setRobot(new TwoDRobot({
        robotType,
        jointPositions: Array(robotType.length).fill(0).map((a, i) => i < jointPositions.length ? jointPositions[i] : a),
        linkLengths: Array(robotType.length + 1).fill(100).map((a, i) => i == 0 ? 0 : i < linkLengths.values.length ? linkLengths.values[i] : a)
      }));
      setLinkLengths(oll => ({ values: Array(robotType.length + 1).fill(100).map((a, i) => i == 0 ? 0 : i < oll.values.length ? oll.values[i] : a) }));
      setJointPositions(ojp => (Array(robotType.length).fill(0).map((a, i) => i < ojp.length ? ojp[i] : a)));
      setApplyFwdKin(true);
    }
  }, [ robotType, applyRobotTypeChange ]);

  // Robot type updates -------------------------------------------------------

  useEffect(() => {
    if (applyLinkLengthChange) {
      setRobot(new TwoDRobot({
        robotType,
        jointPositions: jointPositions.map(jp => jp / 180 * Math.PI),
        linkLengths: linkLengths.values
      }));
      robot?.setJointValues(createJointValues(...jointPositions));
      let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
      setKinematics(kinem);
      setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
      setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
      setA(atan2(
        (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
        (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
      ) / Math.PI * 180);
      setApplyLinkLengthChange(false);
    }
  }, [ linkLengths, applyLinkLengthChange ]);

  // Forward kinematics -------------------------------------------------------

  const createJointValues = (...values: number[]) => {
    const clearedVals = values.map((v, i) => {
      if (robot?.robotTypeName[i] === 'P') {
        return v
      }
      else {
        return v / 180 * Math.PI;
      }
    });
    while (clearedVals.length < (robot?.robotTypeName.length ?? 0)) {
      clearedVals.push(0);
    }
    return clearedVals;
  }

  // useEffect(() => {
  //   if (c.inputType == InputType.FwdKin) {
  //     if (applyFwdKin) {
  //       // robot?.setJointValues(createJointValues(...jointPositions));
  //       let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
  //       setKinematics(kinem);
  //       setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
  //       setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
  //       setA(atan2(
  //         (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
  //         (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
  //       ) / Math.PI * 180);
  //     }
  //   }
  //   setApplyFwdKin(false);
  // }, [applyFwdKin]);

  // Inverse kinematics -------------------------------------------------------

  useEffect(() => {
    if (c.inputType == InputType.InvKin) {
      if (applyInvKin) {
        if (robot?.robotTypeName === 'RRR') {
          let angles = robot?.inverseKinematicsRRR(x, y, a / 180 * Math.PI);
          robot?.setJointValues(createJointValues(...angles.map(a => a / Math.PI * 180)));
          let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
          setKinematics(kinem);
          setJointPositions(angles.map(a => a / Math.PI * 180) ?? Array(robotType.length).fill(0));
        }
      }
    }
    setApplyInvKin(false);
  }, [applyInvKin]);

  // Velocities ---------------------------------------------------------------

  useInterval(() => {
    if (c.inputType == InputType.JointVel) {
      if (angle1Dot != 0) setAngle1(a => a + angle1Dot * 0.016);
      if (angle2Dot != 0) setAngle2(a => a + angle2Dot * 0.016);
      if (angle3Dot != 0) setAngle3(a => a + angle3Dot * 0.016);
      robot?.setJointValues(createJointValues(angle1, angle2, angle3));
      const jacobian = robot?.getJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths.values);
      // const genJacobian = robot?.getGeneralJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths);
      // console.log("Forward");
      // console.log(jacobian);
      // console.log(genJacobian);
      if (jacobian) {
        const cartVels = multiply(jacobian, vector([angle1Dot, angle2Dot, angle3Dot]));
        setXDot(cartVels.toArray()[0] as number);
        setYDot(cartVels.toArray()[1] as number);
        setADot(cartVels.toArray()[2] as number);
      }
      let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
      setKinematics(kinem);
      setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
      setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
      setA(atan2(
        (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
        (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
      ) / Math.PI * 180);
    }
  }, 16);

  useInterval(() => {
    if (c.inputType == InputType.CartVel) {
      const jacobian = robot?.getJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths.values);
      const invJac = robot?.getInverseJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths.values);
      // const invGenJac = robot?.getInverseGeneralJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths);
      if (jacobian && invJac) {
        const r = multiply(invJac, vector([xDot, yDot, aDot]));
        // const z = multiply(jacobian, r);
        setAngle1Dot(r.toArray()[0] as number);
        setAngle2Dot(r.toArray()[1] as number);
        setAngle3Dot(r.toArray()[2] as number);
        if (angle1Dot != 0) setAngle1(a => a + angle1Dot * 0.016);
        if (angle2Dot != 0) setAngle2(a => a + angle2Dot * 0.016);
        if (angle3Dot != 0) setAngle3(a => a + angle3Dot * 0.016);
        robot?.setJointValues(createJointValues(angle1, angle2, angle3));
        let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
        setKinematics(kinem);
        setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setA(atan2(
          (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
          (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
        ) / Math.PI * 180);
      }
      else {
        console.error("No inverse jacobian!");
      }
    }
  }, 16);

  // Trajectory generation

  useEffect(() => {
    if (c.inputType == InputType.Trajectory && trajectoryInputType == TrajectoryInputType.JointSpace && runCubicTrajectory) {
      setRunCubicTrajectory(false);
      const jointTrajectories = [trajectoryJoint1Values, trajectoryJoint2Values, trajectoryJoint3Values];
      const totalTime = 1;
      setCubicAObjects(c => {
        for (var i = 0; i < jointTrajectories.length; i++) {
          const jt = [trajectoryJoint1Values, trajectoryJoint2Values, trajectoryJoint3Values];
          c.push({
            a_0: jt[i][0],
            a_1: 0,
            a_2: 3 / (totalTime**2) * (jt[i][1] - jt[i][0]) - 2 / (totalTime) * 0 - 1 / totalTime * 0,
            a_3: -2 / (totalTime**3) * (jt[i][1] - jt[i][0]) + 1 / (totalTime**2) * (0 + 0)
          });
        }
        return c;
      });
      setTime(0);
      setCubicTrajectoryRunning(true);
    }
    else if (c.inputType == InputType.Trajectory && trajectoryInputType == TrajectoryInputType.CartesianSpace && runCubicTrajectory) {
      console.log("Do cubic trajectory in cartesian space");
    }
  }, [runCubicTrajectory]);

  useEffect(() => {
    if (c.inputType == InputType.Trajectory && trajectoryInputType == TrajectoryInputType.JointSpace && runQuinticTrajectory) {
      setRunQuinticTrajectory(false);
      const jointTrajectories = [trajectoryJoint1Values, trajectoryJoint2Values, trajectoryJoint3Values];
      const totalTime = 1;
      setQuinticAObjects(c => {
        for (var i = 0; i < jointTrajectories.length; i++) {
          const jt = [trajectoryJoint1Values, trajectoryJoint2Values, trajectoryJoint3Values];
          c.push({
            a_0: jt[i][0],
            a_1: 0,
            a_2: 0,
            a_3: (20*jt[i][1]-20*jt[i][0]-(0+0)*totalTime-(3*0-0)*(totalTime**2)) / (2*(totalTime**3)),
            a_4: (30*jt[i][0]-30*jt[i][1]+0) / (2*(totalTime**4)),
            a_5: (12*jt[i][1]-12*jt[i][0]) / (2*(totalTime**5))
          });
        }
        return c;
      });
      setTime(0);
      setQuinticTrajectoryRunning(true);
    }
    else if (c.inputType == InputType.Trajectory && trajectoryInputType == TrajectoryInputType.CartesianSpace && runQuinticTrajectory) {
      console.log("Do quintic trajectory in cartesian space");
    }
  }, [runQuinticTrajectory]);

  useInterval(() => {
    if (cubicTrajectoryRunning) {
      setTime(t => t + 0.016);
      for (var i = 0; i < 3; i++) {
        const a = cubicAObjects[i];
        const set = i == 0 ? setAngle1 : i == 1 ? setAngle2 : setAngle3;
        set(a.a_0 + a.a_1 * time + a.a_2 * (time**2) + a.a_3 * (time**3));
      }
      if (time > 1) setCubicTrajectoryRunning(false);
    }
    else if (quinticTrajectoryRunning) {
      setTime(t => t + 0.016);
      for (var i = 0; i < 3; i++) {
        const a = quinticAObjects[i];
        const set = i == 0 ? setAngle1 : i == 1 ? setAngle2 : setAngle3;
        set(a.a_0 + a.a_1 * time + a.a_2 * (time**2) + a.a_3 * (time**3) + a.a_4 * (time**4) + a.a_5 * (time ** 5));
      }
      if (time > 1) setQuinticTrajectoryRunning(false);
    }
    if (cubicTrajectoryRunning || quinticTrajectoryRunning) {
      robot?.setJointValues(createJointValues(angle1, angle2, angle3));
      let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
      setKinematics(kinem);
      setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
      setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
      setA(atan2(
        (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
        (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
      ) / Math.PI * 180);
    }
  }, 16);

  // Dynamics R -----------------------------------------------------------------

  // useInterval(() => {
  //   if (c.inputType == InputType.Torques) {
  //     const position = robot?.getPositionsByDynamicsR(-9.81, torques[0], 0.016, 2, 1, 0.4, 0.6);
  //     if (position) {
  //       setAngle1(position);
  //       robot?.setJointValues(createJointValues(angle1 / Math.PI * 180/*, angle2, angle3*/));
  //       let kinem = [...Array(jointValues.length + 1).keys()].map(i => robot?.forwardKinematics(i));
  //       setKinematics(kinem);
  //       setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
  //       setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
  //       setA(atan2(
  //         (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
  //         (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
  //       ) / Math.PI * 180);
  //     }
  //   }
  // }, 16);

  // Dynamics RR -----------------------------------------------------------------

  useInterval(() => {
    if (c.inputType == InputType.Torques) {
      // const diff = new Date().getTime() - lastSimTime;
      // console.log(diff * 0.001);
      const positions = robot?.getPositionsByDynamicsRR(gravity, [0, torques[0], torques[1]], 0.016, [0, linkMasses[0], linkMasses[1]], [0, 1, 1], [0, linkWidths[0], linkWidths[1]], jointFrictions.map(jf => jf.staticFriction), jointFrictions.map(jf => jf.dynamicFriction), jointFrictions.map(jf => jf.viscousFriction), eeForces);
      setLastSimTime(new Date().getTime());
      if (positions && positions.length == 2) {
        setAngle1(positions[0]);
        setAngle2(positions[1]);
        robot?.setJointValues(createJointValues(angle1 / Math.PI * 180, angle2 / Math.PI * 180/*, angle3*/));
        let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
        setKinematics(kinem);
        setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setA(atan2(
          (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
          (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
        ) / Math.PI * 180);
      }
    }
  }, 16);

  // Dynamics RRR -----------------------------------------------------------------

  useInterval(() => {
    if (c.inputType == InputType.Torques) {
      // const diff = new Date().getTime() - lastSimTime;
      // console.log(diff * 0.001);
      // const controlTorques = robot?.getControlTorquesForDynamicsRRR(gravity, positionsToHold.map(p => p / 180 * Math.PI), [0, 0, 0], [0, 0, 0], 0.016, [0, linkMasses[0], linkMasses[1], linkMasses[2]], [0, 1, 1, 0.5], [0, linkWidths[0], linkWidths[1], linkWidths[2]], jointFrictions.map(jf => jf.staticFriction), jointFrictions.map(jf => jf.dynamicFriction), jointFrictions.map(jf => jf.viscousFriction), eeForces);
      // if (controlTorques) {
        const positions = robot?.getPositionsByDynamicsRRR(gravity, [0, torques[0], torques[1], torques[2]], 0.004, [0, linkMasses[0], linkMasses[1], linkMasses[2]], [0, 1, 1, 0.5], [0, linkWidths[0], linkWidths[1], linkWidths[2]], jointFrictions.map(jf => jf.staticFriction), jointFrictions.map(jf => jf.dynamicFriction), jointFrictions.map(jf => jf.viscousFriction), eeForces);
        setLastSimTime(new Date().getTime());
        if (positions && positions.length == 3) {
          setAngle1(positions[0]);
          setAngle2(positions[1]);
          setAngle3(positions[2]);
          robot?.setJointValues(createJointValues(angle1 / Math.PI * 180, angle2 / Math.PI * 180, angle3 / Math.PI * 180));
          let kinem = [...Array(robotType.length + 1).keys()].map(i => robot?.forwardKinematics(i));
          setKinematics(kinem);
          setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
          setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
          setA(atan2(
            (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
            (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
          ) / Math.PI * 180);
        }
      // }
    }
  }, 4);

  // Return -------------------------------------------------------------------

  return {
    kinematics, robot,
    angle1, setAngle1,
    angle2, setAngle2,
    angle3, setAngle3,
    x, setX,
    y, setY,
    a, setA,
    setApplyFwdKin, setApplyInvKin,
    angle2Dot, setAngle2Dot,
    angle3Dot, setAngle3Dot,
    angle1Dot, setAngle1Dot,
    xDot, setXDot,
    yDot, setYDot,
    aDot, setADot,
    setApplyJointVelocities, setApplyCartesianVelocities,
    trajectoryJoint1Values, setTrajectoryJoint1Values,
    trajectoryJoint2Values, setTrajectoryJoint2Values,
    trajectoryJoint3Values, setTrajectoryJoint3Values,
    trajectoryEECartXValues, setTrajectoryEECartXValues,
    trajectoryEECartYValues, setTrajectoryEECartYValues,
    trajectoryEECartZValues, setTrajectoryEECartZValues,
    trajectoryInputType, setTrajectoryInputType,
    setRunCubicTrajectory, setRunQuinticTrajectory,
    torques, setTorques, linkMasses, setLinkMasses,
    linkWidths, setLinkWidths,
    jointFrictions, setJointFrictions,
    gravity, setGravity,
    eeForces, setEeForces,
    positionsToHold, setPositionsToHold,
    jointPositions, setJointPositions,
    robotType, setRobotType,
    linkLengths, setLinkLengths,
    applyLinkLengthChange, setApplyLinkLengthChange,
    applyRobotTypeChange, setApplyRobotTypeChange,
    dhParameters, setDhParameters,
    applyDhChange, setApplyDhChange
  }


}