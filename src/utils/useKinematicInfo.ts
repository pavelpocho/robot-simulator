import math, { atan2, MathNumericType, matrix, multiply, pi } from "mathjs";
import nerdamer from "nerdamer";
import React, { useContext, useEffect } from "react";
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

export interface AccelCalcData {
  t: number[], td: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number
}

interface ParameterQueue {
  angle1Positions: number[];
  angle1Velocities: number[];
  angle1Accelerations: number[];
  angle2Positions: number[];
  angle2Velocities: number[];
  angle2Accelerations: number[];
}

export const useKinematicInfo = () => {

  const robotType = RRR_2D_Robot_Type;
  const jointValues = [0, 0, 0];
  const linkLengths = [0, 100, 100, 50];

  // const robotType = RR_2D_Robot_Type;
  // const jointValues = [0, 0];
  // const linkLengths = [0, 100, 50];

  // const robotType = R_2D_Robot_Type;
  // const jointValues = [0];
  // const linkLengths = [0, 100];

  // const robotType = P_2D_Robot_Type;
  // const jointValues = [0];
  // const linkLengths = [50, 50];

  // const robotType = RRPR_2D_Robot_Type;
  // const jointValues = [0, 0, 0, 0];
  // const linkLengths = [75, 50, 50, 50, 50];

  const [robot, setRobot] = useState<TwoDRobot | null>(null);
  const [angle1, setAngle1] = useState<number>(30);
  const [angle2, setAngle2] = useState<number>(30);
  const [angle3, setAngle3] = useState<number>(30);
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

  const [angle1DotDot, setAngle1DotDot] = useState<number>(0.1);
  const [angle2DotDot, setAngle2DotDot] = useState<number>(0.1);
  const [angle3DotDot, setAngle3DotDot] = useState<number>(0);
  const [torque1, setTorque1] = useState<number>(0);
  const [torque2, setTorque2] = useState<number>(0);
  const [torque3, setTorque3] = useState<number>(0);
  const [applyAccelerations, setApplyAccelerations] = useState<boolean>(false);
  const [applyTorques, setApplyTorques] = useState<boolean>(false);

  const c = useInputTypeContext();

  // Initialization -----------------------------------------------------------

  useEffect(() => {
    setRobot(new TwoDRobot({
      robotType,
      jointValues,
      linkLengths
    }));
  }, []);

  // Forward kinematics -------------------------------------------------------

  const createJointValues = (...values: number[]) => {
    const clearedVals = values.map((v, i) => {
      if (robot?.jointTypes[i] === 'P') {
        return v
      }
      else {
        return v / 180 * Math.PI;
      }
    });
    while (clearedVals.length < (robot?.jointTypes.length ?? 0)) {
      clearedVals.push(0);
    }
    return clearedVals;
  }

  useEffect(() => {
    if (c.inputType == InputType.FwdKin) {
      if (applyFwdKin) {
        robot?.setJointValues(createJointValues(angle1, angle2, angle3));
        let kinem = [...Array(jointValues.length + 1).keys()].map(i => robot?.forwardKinematics(i));
        setKinematics(kinem);
        setX((kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setY((kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0,0,0,0])[3] as (number | null | undefined) ?? 0);
        setA(atan2(
          (kinem[kinem.length - 1]?.toArray()[1] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0,
          (kinem[kinem.length - 1]?.toArray()[0] as MathNumericType[] | undefined ?? [0])[0] as number | null | undefined ?? 0
        ) / Math.PI * 180);
      }
    }
    setApplyFwdKin(false);
  }, [applyFwdKin]);

  // Inverse kinematics -------------------------------------------------------

  useEffect(() => {
    if (c.inputType == InputType.InvKin) {
      if (applyInvKin) {
        if (robot?.robotTypeName === 'RRR') {
          let angles = robot?.inverseKinematicsRRR(x, y, a / 180 * Math.PI);
          robot?.setJointValues(angles ?? [0,0,0,0]);
          let kinem = [...Array(jointValues.length + 1).keys()].map(i => robot?.forwardKinematics(i));
          setKinematics(kinem);
          setAngle1(angles ? angles[0] / Math.PI * 180 : 0);
          setAngle2(angles ? angles[1] / Math.PI * 180 : 0);
          setAngle3(angles ? angles[2] / Math.PI * 180 : 0);
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
      const jacobian = robot?.getJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths);
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
      let kinem = [...Array(jointValues.length + 1).keys()].map(i => robot?.forwardKinematics(i));
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
      const jacobian = robot?.getJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths);
      const invJac = robot?.getInverseJacobian([angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, angle3 / 180 * Math.PI], linkLengths);
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
        let kinem = [...Array(jointValues.length + 1).keys()].map(i => robot?.forwardKinematics(i));
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

  // Return -------------------------------------------------------------------

  return {
    kinematics, robotType, robot,
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
    angle1DotDot, setAngle1DotDot,
    angle2DotDot, setAngle2DotDot,
    angle3DotDot, setAngle3DotDot,
    torque1, setTorque1,
    torque2, setTorque2,
    torque3, setTorque3,
    setApplyAccelerations, setApplyTorques
  }


}