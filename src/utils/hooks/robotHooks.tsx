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

const getCompiledJacobian = (robot: Robot) => {
  const rotationMatrices = robot.dhTable.map((_, i) => getSymbolicRotationMatrix(i+1));
    
  const transposedRotationMatrices = rotationMatrices.map(r => nerdamer(`transpose(${r.text('fractions')})`));
  const translationVectors = robot.dhTable.map((_, i) => getSymbolicTranslationVector(i+1));

  // The last rotationMatrix goes to end effector, which is not a joint and thus isn't represented in the robotType
  // Nope, there is an 'E' in the place of an end effector, so they are the same length!
  if (robot.type.length > rotationMatrices.length) {
    throw "Incorrect robot type set";
  }

  // Here rotationMatrices[0] corresponds to DH row 1, aka. representing frame 1 in frame 0 (0 on top, 1 on bottom, aka. R01)
  // Here transposedRotationMatrices[0] corresponds to inverse of DH row 1, aka. representing frame 0 in frame 1 (1 on top, 0 on bottom, aka. R10)
  // So on... until:
  // rotationMatrices[i] is max, where i is number of joints and rotationMatrices[i] points to the End effector
  // So:

  for (let i = 0; i < rotationMatrices.length; i++) {
    nerdamer.setVar(`R${i}${i+1}`, rotationMatrices[i].text('fractions'));
    nerdamer.setVar(`R${i+1}${i}`, transposedRotationMatrices[i].text('fractions'));
  }

  nerdamer.setVar('omega_0', 'matrix([0], [0], [0])');
  nerdamer.setVar('v_0', 'matrix([0], [0], [0])');

  for (let i = 1; i <= robot.type.length; i++) {
    console.log("Loop", i);
    if (robot.type[i-1] === 'R') {
      nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[td${i}]))`);
      const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
      nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))`);
    }
    else if (robot.type[i-1] === 'P') {
      nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})`);
      const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
      nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))+(matrix([0],[0],[d_${i}]))`);
    }
    else if (robot.type[i-1] === 'E') {
      nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})`);
      const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
      nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))`); 
    }
  }

  console.log('got past first for');

  // These should now be the final (End effector) values
  const v_final = nerdamer.getVars('text')[`v_${robot.type.length}`];
  const omega_final = nerdamer.getVars('text')[`omega_${robot.type.length}`];

  // The jacobian has n columns where n is the number of joints
  // and m rows where m is the degrees of freedom there are

  console.log('finals');

  const jacobian = [...Array(6).keys()].map(_ => [...Array(robot.type.length - 1).keys()].map(_ => '0'));

  console.log('got jacobian');

  for (let i = 0; i < jacobian.length; i++) {
    console.log('i', i);
    const splitRow = nerdamer(`expand(matget(${i < 3 ? v_final : omega_final}, ${i % 3}, 0))`).text().split('+');
    const separatedStrings = Array(robot.type.length - 1).fill('');
    splitRow.forEach((bit) => {
      for (let j = 0; j < jacobian[i].length; j++) {
        if (bit.includes(`td${j+1}`)) {
          separatedStrings[j] += (separatedStrings[j] === '' ? '' : '+') + bit.replace(`td${j+1}`, `1`);
        }
      }
    });

    for (let j = 0; j < jacobian[i].length; j++) {
      // console.log('j is', j);
      // const x = nerdamer(`expand(matget(${i < 3 ? v_final : omega_final}, ${i % 3}, 0))`)
      //   .text()
      //   .split('+')
      //   .filter(x => x.includes(`td${j+1}`))
      //   .map(x => x.replace(`td${j+1}`, '1'))
      //   .join('+');
      // if (x != '') jacobian[i][j] = x;
      jacobian[i][j] = separatedStrings[j];
    }
  }

  const completeJacobian = nerdamer(`matrix(${jacobian.map(jRow => `[${jRow.map(j => j).join(', ')}]`).join(', ')})`);
  // The transposed ones here might be wrong
  const doubledRotationMatrices = robot.dhTable.map((_, i) => getSymbolicDoubledRotationMatrix(i+1));
  const downToZeroRotMat = nerdamer(doubledRotationMatrices.slice(0, robot.type.length).map(r => `(${r.text('fractions')})`).join('*'));
  const convertedJacobian = nerdamer(`${downToZeroRotMat.text('fractions')}*${completeJacobian.text('fractions')}`);

  const compiledCode = compile(convertedJacobian.text('fractions').replace('matrix(', 'matrix([').slice(0, -1).concat('])'));
  
  // There is a possibility that there is an error here, because the results don't match the original handmade method
  // if theta_2 is not 0, but there is not theta_2-specific code here, so it shouldn't be broken for it
  console.log("Compiled jacobian code!");
  return compiledCode;
}

export const useCompiledJacobian = () => {
  const { robot } = useRobotContext();
  return useMemo(() => getCompiledJacobian(robot), [robot.type]);
}

export const getEvaluatedJacobian = (robot: Robot, compiledCode: math.EvalFunction | undefined) => {
  if (compiledCode == undefined) {
    return null;
  }
  const scope = {
    a0: robot.dhTable[0].a_i_minus_1,
    al0: robot.dhTable[0].alpha_i_minus_1,
    d1: robot.dhTable[0].d_i,
    t1: robot.dhTable[0].theta_i,
    a1: robot.dhTable[1].a_i_minus_1,
    al1: robot.dhTable[1].alpha_i_minus_1,
    d2: robot.dhTable[1].d_i,
    t2: robot.dhTable[1].theta_i,
    a2: robot.dhTable[2].a_i_minus_1,
    al2: robot.dhTable[2].alpha_i_minus_1,
    d3: robot.dhTable[2].d_i,
    t3: robot.dhTable[2].theta_i,
    a3: robot.dhTable[3].a_i_minus_1,
    al3: robot.dhTable[3].alpha_i_minus_1,
    d4: robot.dhTable[3].d_i,
    t4: robot.dhTable[3].theta_i,
    td1: robot.jointVelocities[0],
    td2: robot.jointVelocities[1],
    td3: robot.jointVelocities[2]
  }

  return compiledCode.evaluate(scope);
}


// i here is number of the dh row
const getSymbolicRotationMatrix = (i: number) => {
  return nerdamer(`
    matrix(
      [cos(t${i}), -sin(t${i}), 0],
      [sin(t${i})*cos(al${i-1}), cos(t${i})*cos(al${i-1}), -sin(al${i-1})],
      [sin(t${i})*sin(a${i-1}), cos(t${i})*sin(al${i-1}), cos(al${i-1})]
    )
  `);
}

// i here is number of the dh row
const getSymbolicDoubledRotationMatrix = (i: number) => {
  return nerdamer(`
    matrix(
      [cos(t${i}), -sin(t${i}), 0, 0, 0, 0],
      [sin(t${i})*cos(al${i-1}), cos(t${i})*cos(al${i-1}), -sin(al${i-1}), 0, 0, 0],
      [sin(t${i})*sin(al${i-1}), cos(t${i})*sin(al${i-1}), cos(al${i-1}), 0, 0, 0],
      [0, 0, 0, cos(t${i}), -sin(t${i}), 0],
      [0, 0, 0, sin(t${i})*cos(al${i-1}), cos(t${i})*cos(al${i-1}), -sin(al${i-1})],
      [0, 0, 0, sin(t${i})*sin(al${i-1}), cos(t${i})*sin(al${i-1}), cos(al${i-1})]
    )
  `);
}

// i here is number of the dh row
const getSymbolicTransformationMatrix = (i: number) => {
  return nerdamer(`
    matrix([cos(t${i}), -sin(t${i}), 0, a_${i-1}], [sin(t${i})*cos(al${i-1}), cos(t${i})*cos(al${i-1}), -sin(al${i-1}), -sin(al${i-1})*d_${i}], [sin(t${i})*sin(al${i-1}), cos(t${i})*sin(al${i-1}), cos(al${i-1}), cos(al${i-1})*d_${i}], [0, 0, 0, 1])
  `);
}

// i here is number of the dh row
const getSymbolicTranslationVector = (i: number) => {
  return nerdamer(`
    [a_${i-1}, -sin(al${i-1})*d${i}, cos(al${i-1})*d${i}]
  `);
}