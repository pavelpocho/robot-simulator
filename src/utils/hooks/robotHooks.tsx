import math, { acos, atan2, cos, matrix, multiply, sin, transpose } from "mathjs";
import nerdamer from "nerdamer";
import { MathWrapper } from "../../components/ui/math-wrapper";
import { AR } from "../../wrapper";
import { getInverseEqAnAx, getInverseEulerParams, getInverseXYZFixedAngles, getInverseZYXCardanoAngles, getInverseZYZEulerAngles, getZYZEulerAngles } from "../angle-utils";
import { LinkParameter, Robot, useRobotContext } from "../contexts/RobotContext"
import vector from "../vector";

export const useNumberOfJoints = () => {
  const { robot } = useRobotContext();
  return (robot?.type.length ?? 1) - 1;
}

export const getNumbericTMsFrom0ToN = (robot: Robot) => {
  // Including end effector so + 1
  const numberOfJoints = (robot?.type.length ?? 1);
  return [...Array(robot?.type.length).keys()].map((n) => (
    getNumbericTMFrom0ToN(robot, numberOfJoints, n)
  ))
}

export const useNumbericTMsFrom0ToN = () => {
  const { robot } = useRobotContext();
  // Including end effector so + 1
  const numberOfJoints = useNumberOfJoints() + 1;
  return [...Array(robot?.type.length).keys()].map((n) => (
    getNumbericTMFrom0ToN(robot, numberOfJoints, n)
  ))
}

export const useNumbericTMsFromNMin1ToN = () => {
  const { robot } = useRobotContext();
  // Including end effector so + 1
  return [...Array(robot?.type.length).keys()].map((n) => (
    getTransformationMatrixForRow(robot, n+1)
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

// export const useMathJaxTMSubstituted = () => {
//   const { robot } = useRobotContext();
//   return robot.dhTable.map((_, i) => {
//     return <MathWrapper key={i} tex={getMathJaxTMSubstitutedForRow(robot.dhTable, i+1)} />
//   });
// }

// This method is for row 'n' in the dh table, where n is 1-based
export const getMathJaxTMSubstitutedForRow = (dhTable: LinkParameter[], n: number) => {
  const link = dhTable[n-1];
  const j = link.i;
  const a_i_min_1 = link.a_i_minus_1.toFixed(2);
  const alpha_i_min_1 = link.alpha_i_minus_1.toFixed(2);
  const d_i = link.d_i.toFixed(2);
  const theta_i = link.theta_i.toFixed(2);
  return String.raw`{_${j}^{${j-1}}}T=\left[ \begin{array}{ccc}c(${theta_i}) & -s(${theta_i}) & 0 & ${a_i_min_1} \\ s(${theta_i})c(${alpha_i_min_1}) & c(${theta_i})c(${alpha_i_min_1}) & -s(${alpha_i_min_1}) & -s(${alpha_i_min_1})${d_i} \\ s(${theta_i})s(${alpha_i_min_1}) & c(${theta_i})s(${alpha_i_min_1}) & c(${alpha_i_min_1}) & c(${alpha_i_min_1})${d_i} \\ 0 & 0 & 0 & 1\end{array} \right]`
}

// export const useMathJaxTMSolved = () => {
//   const { robot } = useRobotContext();
//   return robot.dhTable.map((_, i) => {
//     return <MathWrapper key={i} tex={getMathJaxTMSolvedForRow(robot.dhTable, i+1)} />
//   })
// }

// This method is for row 'n' in the dh table, where n is 1-based
export const getMathJaxTMSolvedForRow = (dhTable: LinkParameter[], n: number) => {
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
    if (!m) return ''
    const str = String.raw`{_${i+2}^{${0}}}T=\left[ \begin{array}{ccc}
      ${mF(m, 0, 0)} & ${mF(m, 0, 1)} & ${mF(m, 0, 2)} & ${mF(m, 0, 3)} \\ 
      ${mF(m, 1, 0)} & ${mF(m, 1, 1)} & ${mF(m, 1, 2)} & ${mF(m, 1, 3)} \\ 
      ${mF(m, 2, 0)} & ${mF(m, 2, 1)} & ${mF(m, 2, 2)} & ${mF(m, 2, 3)} \\
      0 & 0 & 0 & 1\end{array} \right]`
    return str;
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

export const getInverseKinematics = (robot: Robot) => {
  // This is the offset in the fwd kin
  // The 0 in the second correction might change if we allow changing of angle from base
  const ee_dist_y = robot.dhTable[3].a_i_minus_1 * sin(robot.cartesianEEPositions[5]) + robot.dhTable[0].a_i_minus_1 * sin(0);
  const ee_dist_x = robot.dhTable[3].a_i_minus_1 * cos(robot.cartesianEEPositions[5]) + robot.dhTable[0].a_i_minus_1 * cos(0);
  const xT = robot.cartesianEEPositions[0] - ee_dist_x;
  const yT = robot.cartesianEEPositions[1] - ee_dist_y;

  const c_theta_2 = (Math.pow(xT, 2) + Math.pow(yT, 2) - Math.pow(robot.dhTable[1].a_i_minus_1, 2) - Math.pow(robot.dhTable[2].a_i_minus_1, 2)) / (2 * robot.dhTable[1].a_i_minus_1 * robot.dhTable[2].a_i_minus_1);
  const s_theta_2 = Math.sqrt(1-Math.pow(c_theta_2, 2));

  const t_2 = atan2(s_theta_2, c_theta_2);
  
  const k_1 = robot.dhTable[1].a_i_minus_1 + robot.dhTable[2].a_i_minus_1*c_theta_2;
  const k_2 = robot.dhTable[2].a_i_minus_1*s_theta_2;

  const t_1 = atan2(yT, xT) - atan2(k_2, k_1);
  const t_3 = robot.cartesianEEPositions[5] - t_1 - t_2;
  
  return [t_1, t_2, t_3];
}

export const getInverseKinematicsFP = (robot: Robot) => {
  // First principles derivation of the same thing as is above for explanation purposes
  const ee_dist_y = robot.dhTable[3].a_i_minus_1 * sin(robot.cartesianEEPositions[5]) + robot.dhTable[0].a_i_minus_1 * sin(0);
  const ee_dist_x = robot.dhTable[3].a_i_minus_1 * cos(robot.cartesianEEPositions[5]) + robot.dhTable[0].a_i_minus_1 * cos(0);
  const xT = robot.cartesianEEPositions[0] - ee_dist_x;
  const yT = robot.cartesianEEPositions[1] - ee_dist_y;
  const a1 = robot.dhTable[1].a_i_minus_1;
  const a2 = robot.dhTable[2].a_i_minus_1;

  const theta_target = atan2(yT, xT);
  const r_target = Math.sqrt(xT ** 2 + yT ** 2);
  console.log('theta_target', theta_target);
  console.log('xT', xT, 'yT', yT);
  console.log('a1', a1, 'a2', a2);
  console.log('t1acos', acos((-(a2 ** 2) + a1 ** 2 + r_target ** 2) / (2 * a1 * r_target)));
  const t_1 = (theta_target - acos((-(a2 ** 2) + a1 ** 2 + r_target ** 2) / (2 * a1 * r_target)));
  const t_2 = Math.PI - acos((-(r_target ** 2) + a1 ** 2 + a2 ** 2) / (2 * a1 * a2));
  const t_3 = robot.cartesianEEPositions[5] - t_1 - t_2;

  return [t_1, t_2, t_3];

}

export const getPiepersInverseKinematics = (robot: Robot) => {

  const rc = robot.cartesianEEPositions;
  const fullTM = robot.angleRepresentation === AR.XYZFixed ? (
    getInverseXYZFixedAngles(rc[5], rc[4], rc[3])
  ) : robot.angleRepresentation === AR.ZYXEuler ? (
    getInverseZYXCardanoAngles(rc[5], rc[4], rc[3])
  ) : robot.angleRepresentation === AR.ZYZEuler ? (
    getInverseZYZEulerAngles(rc[5], rc[4], rc[3])
  ) : robot.angleRepresentation === AR.EqAnAx ? (
    getInverseEqAnAx(rc[3], rc[4], rc[5], rc[6])
  ) : robot.angleRepresentation === AR.EulerParams ? (
    getInverseEulerParams(rc[3], rc[4], rc[5], rc[6])
  ) : null
  if (fullTM == null) return;

  const eeOffset = multiply(fullTM, vector([ robot.dhTable.slice(-1)[0].a_i_minus_1, 0, 0 ])).toArray() as number[];

  // this y-offset should be figured out...
  const yOffset = robot.dhTable[1].d_i + robot.dhTable[2].d_i;

  const xT = robot.cartesianEEPositions[0] - eeOffset[0];
  const yT = robot.cartesianEEPositions[1] - eeOffset[1];
  let zT = robot.cartesianEEPositions[2] - eeOffset[2];

  // The end effector distance compensation here will be based on the a_last distance only, just with a 3D direction

  // This is the actual thought process, use in video:

  // Projection of end effector on XY plane and also a radial coordinate
  const rT = Math.sqrt(Math.pow(xT, 2) + Math.pow(yT, 2));
  const t_1 = atan2(yT, xT);

  // Joints two and three affect position on R,Z plane
  // d_1 determines the default height position (Z)
  // Do same thing on R,Z that the basic IK does on X,Y
  // Then d_2 and d_3 determine the Y-coordinate, because joints 2 and 3
  // have to be parallel and orthogonal to joint 1

  zT -= robot.dhTable[0].d_i;

  const c_theta_2 = (Math.pow(rT, 2) + Math.pow(zT, 2) - Math.pow(robot.dhTable[2].a_i_minus_1, 2) - Math.pow(robot.dhTable[3].d_i, 2)) / (2 * robot.dhTable[2].a_i_minus_1 * robot.dhTable[3].d_i);
  const s_theta_2 = Math.sqrt(1-Math.pow(c_theta_2, 2));

  const t_3 = Math.PI / 2 - atan2(s_theta_2, c_theta_2);
  
  const k_1 = robot.dhTable[2].a_i_minus_1 + robot.dhTable[3].d_i*c_theta_2;
  const k_2 = robot.dhTable[3].d_i*s_theta_2;

  const t_2 = -(atan2(zT, rT) - atan2(k_2, k_1));

  const zeroToSixRotation = (fullTM?.toArray() as number[][]);

  const zeroToThreeTM = getNumbericTMFrom0ToN({
    ...robot,
    jointPositions: [ t_1, t_2, t_3, 0, 0, 0 ],
    dhTable: [
      ...robot.dhTable.map((d, i) => ({
        ...d,
        theta_i: i == 0 ? t_1 : i == 1 ? t_2 : i == 2 ? t_3 : 0
      }))
    ]
  }, robot.type.length, 3);
  const negatedZeroToThreeRotation = (transpose(zeroToThreeTM ?? matrix([[0]])).toArray() as number[][]).slice(0, -1).map((a) => a.slice(0, -1));
  const targetMatrix1 = multiply(matrix(negatedZeroToThreeRotation), matrix(zeroToSixRotation));
  const offset1 = transpose(matrix([[0.9999999999956841, 2.2761033537425056e-7, 0.0000029291579001554467], [-2.2638332037314482e-7, 0.999999912265543, -0.00041889002737169], [-0.000002929252986878122, 0.0004188900267066809, 0.9999999122612786]]));
  const try1 = multiply(targetMatrix1, offset1);
  return [ t_1, t_2, t_3 ].concat(getZYZEulerAngles(try1.toArray()));

}

export const getSymbolicDoubledRotationMatrix = (i: number) => {
  return nerdamer(`
    matrix(
      [cos(theta_${i}), -sin(theta_${i}), 0, 0, 0, 0],
      [sin(theta_${i})*cos(alpha_${i-1}), cos(theta_${i})*cos(alpha_${i-1}), -sin(alpha_${i-1}), 0, 0, 0],
      [sin(theta_${i})*sin(alpha_${i-1}), cos(theta_${i})*sin(alpha_${i-1}), cos(alpha_${i-1}), 0, 0, 0],
      [0, 0, 0, cos(theta_${i}), -sin(theta_${i}), 0],
      [0, 0, 0, sin(theta_${i})*cos(alpha_${i-1}), cos(theta_${i})*cos(alpha_${i-1}), -sin(alpha_${i-1})],
      [0, 0, 0, sin(theta_${i})*sin(alpha_${i-1}), cos(theta_${i})*sin(alpha_${i-1}), cos(alpha_${i-1})]
    )
  `);
}

export const isPieper = (r: Robot) => {
  const d = r.dhTable;
  if (d.length < 6) return false;
  const isPieper = (
    Math.abs(d[1].alpha_i_minus_1) == 1.57 &&
    d[1].alpha_i_minus_1 == -d[3].alpha_i_minus_1 &&
    d[1].d_i == -d[2].d_i &&
    d[2].a_i_minus_1 != 0 && d[3].d_i != 0 &&
    d[3].a_i_minus_1 == 0 &&
    d[3].alpha_i_minus_1 == 1.57 && d[5].alpha_i_minus_1 == 1.57 &&
    d[4].alpha_i_minus_1 == -1.57 &&
    d.slice(-1)[0].theta_i == 0 && d.slice(-1)[0].d_i == 0 && d.slice(-1)[0].alpha_i_minus_1 == 0
  );
  return isPieper;
}