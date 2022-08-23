import { MathComponent } from "mathjax-react";
import math, { compile, cos, matrix, multiply, sin } from "mathjs";
import nerdamer from "nerdamer";
import { useMemo } from "react";
import { LinkParameter, Robot, useRobotContext } from "../contexts/RobotContext"

export const useNumberOfJoints = () => {
  const { robot } = useRobotContext();
  return (robot?.type.length ?? 1) - 1;
}

export const useNumbericTMsFrom0ToN = () => {
  const { robot } = useRobotContext();
  // Including end effector so + 1
  const numberOfJoints = useNumberOfJoints() + 1;
  return [...Array(robot?.type.length).keys()].map((n) => (
    getNumbericTMFrom0ToN(robot, numberOfJoints, n)
  ))
}

const getNumbericTMFrom0ToN = (robot: Robot, numberOfJoints: number, n: number) => {
  if (n > numberOfJoints) return null;
    const transformMatrices = robot.dhTable.slice(0, n+1).map((_, i) => getTransformationMatrixForRow(robot, i+1));
    if (transformMatrices === undefined) return null;
    const totalTransform = transformMatrices.reduce((acc, value) => {
      return multiply(acc, value);
    }, matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]));
    return totalTransform;
}

// This method is for row 'n' in the dh table, where n is 1-based
export const getTransformationMatrixForRow = (robot: Robot, n: number) => {
  const a = robot.dhTable[n-1].a_i_minus_1 ?? 0;
  const al = robot.dhTable[n-1].alpha_i_minus_1 ?? 0;
  const d = robot.dhTable[n-1].d_i ?? 0;
  const t = robot.dhTable[n-1].theta_i ?? 0;
  return matrix([
    [cos(t), -sin(t), 0, a],
    [sin(t)*cos(al), cos(t)*cos(al), -sin(al), -sin(al)*d],
    [sin(t)*sin(al), cos(t)*sin(al), cos(al), cos(al)*d],
    [0, 0, 0, 1]
  ])
}

export const useMathJaxTMSubstituted = () => {
  const { robot } = useRobotContext();
  return robot.dhTable.map((_, i) => {
    return <MathComponent key={i} tex={getMathJaxTMSubstitutedForRow(robot.dhTable, i+1)} />
  });
}

// This method is for row 'n' in the dh table, where n is 1-based
const getMathJaxTMSubstitutedForRow = (dhTable: LinkParameter[], n: number) => {
  const link = dhTable[n-1];
  const j = link.i;
  const a_i_min_1 = link.a_i_minus_1.toFixed(2);
  const alpha_i_min_1 = link.alpha_i_minus_1.toFixed(2);
  const d_i = link.d_i.toFixed(2);
  const theta_i = link.theta_i.toFixed(2);
  return String.raw`{_${j}^{${j-1}}}T=\left[ \begin{array}{ccc}c(${theta_i}) & -s(${theta_i}) & 0 & ${a_i_min_1} \\ s(${theta_i})c(${alpha_i_min_1}) & c(${theta_i})c(${alpha_i_min_1}) & -s(${alpha_i_min_1}) & -s(${alpha_i_min_1})${d_i} \\ s(${theta_i})s(${alpha_i_min_1}) & c(${theta_i})s(${alpha_i_min_1}) & c(${alpha_i_min_1}) & c(${alpha_i_min_1})${d_i} \\ 0 & 0 & 0 & 1\end{array} \right]`
}

export const useMathJaxTMSolved = () => {
  const { robot } = useRobotContext();
  return robot.dhTable.map((_, i) => {
    return <MathComponent key={i} tex={getMathJaxTMSolvedForRow(robot.dhTable, i+1)} />
  })
}

// This method is for row 'n' in the dh table, where n is 1-based
const getMathJaxTMSolvedForRow = (dhTable: LinkParameter[], n: number) => {
  const link = dhTable[n-1];
  const j = link.i;
  return String.raw`{_${j}^{${j-1}}}T=\left[ \begin{array}{ccc}${cos(link.theta_i).toFixed(2)} & ${-sin(link.theta_i).toFixed(2)} & 0 & ${link.a_i_minus_1} \\ ${(sin(link.theta_i)*cos(link.alpha_i_minus_1)).toFixed(2)} & ${(cos(link.theta_i)*cos(link.alpha_i_minus_1)).toFixed(2)} & ${(-sin(link.alpha_i_minus_1)).toFixed(2)} & ${(-sin(link.alpha_i_minus_1)*link.d_i).toFixed(2)} \\ ${(sin(link.theta_i)*sin(link.alpha_i_minus_1)).toFixed(2)} & ${(cos(link.theta_i)*sin(link.alpha_i_minus_1)).toFixed(2)} & ${(cos(link.alpha_i_minus_1)).toFixed(2)} & ${(cos(link.alpha_i_minus_1)*link.d_i).toFixed(2)} \\ 0 & 0 & 0 & 1\end{array} \right]`;
}

export const useMathJaxTMCombined = () => {
  const numberOfJoints = useNumberOfJoints();
  const { robot } = useRobotContext();
  const mF = (m: math.Matrix, i: number, j: number) => ((m?.toArray()[i] as number[])[j]as number).toFixed(2);
  return [...Array(numberOfJoints).keys()].map(i => {
    const m = getNumbericTMFrom0ToN(robot, numberOfJoints, i+1);
    if (!m) return <></>
    const str = String.raw`{_${i+2}^{${0}}}T=\left[ \begin{array}{ccc}
      ${mF(m, 0, 0)} & ${mF(m, 0, 1)} & ${mF(m, 0, 2)} & ${mF(m, 0, 3)} \\ 
      ${mF(m, 1, 0)} & ${mF(m, 1, 1)} & ${mF(m, 1, 2)} & ${mF(m, 1, 3)} \\ 
      ${mF(m, 2, 0)} & ${mF(m, 2, 1)} & ${mF(m, 2, 2)} & ${mF(m, 2, 3)} \\
      0 & 0 & 0 & 1\end{array} \right]`
    return <MathComponent key={i} tex={str} />
  });
}

export const getEvaluatedJacobian = (robot: Robot, compiledCode: math.EvalFunction | undefined) => {
  if (compiledCode == undefined) {
    return null;
  }
  const scope = {}

  for (let i = 0; i < robot.dhTable.length; i++) {
    const d = `d${i+1}`;
    const t = `t${i+1}`;
    const td = `td${i+1}`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scope[d] = robot.dhTable[i].d_i;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scope[t] = robot.dhTable[i].theta_i;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scope[td] = robot.jointVelocities[i];
  }

  return compiledCode.evaluate(scope);
}