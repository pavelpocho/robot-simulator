import { Robot } from './contexts/RobotContext';
import nerdamer from 'nerdamer';

onmessage = (ev: MessageEvent<Robot>) => {
  postMessage(getCompiledJacobian(ev.data));
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

  for (let i = 0; i < robot.dhTable.length; i++) {
    const a = `a${i}`;
    const al = `al${i}`;
    nerdamer.setVar(a, robot.dhTable[i].a_i_minus_1);
    nerdamer.setVar(al, robot.dhTable[i].alpha_i_minus_1);
  }

  // These should now be the final (End effector) values
  const v_final = nerdamer(nerdamer.getVars('text')[`v_${robot.type.length}`]).evaluate().text('fractions');
  const omega_final = nerdamer(nerdamer.getVars('text')[`omega_${robot.type.length}`]).evaluate().text('fractions');

  return { v_final, omega_final }
}

export interface JacSectionMessage {
  v_final: string,
  omega_final: string,
  i: number,
  robotType: string
}

// i here is number of the dh row
const getSymbolicRotationMatrix = (i: number) => {
  return nerdamer(`
    matrix(
      [cos(t${i}), -sin(t${i}), 0],
      [sin(t${i})*cos(al${i-1}), cos(t${i})*cos(al${i-1}), -sin(al${i-1})],
      [sin(t${i})*sin(al${i-1}), cos(t${i})*sin(al${i-1}), cos(al${i-1})]
    )
  `);
}

// i here is number of the dh row
const getSymbolicTransformationMatrix = (i: number) => {
  return nerdamer(`
    matrix([cos(t${i}), -sin(t${i}), 0, a${i-1}], [sin(t${i})*cos(al${i-1}), cos(t${i})*cos(al${i-1}), -sin(al${i-1}), -sin(al${i-1})*d${i}], [sin(t${i})*sin(al${i-1}), cos(t${i})*sin(al${i-1}), cos(al${i-1}), cos(al${i-1})*d${i}], [0, 0, 0, 1])
  `);
}

// i here is number of the dh row
const getSymbolicTranslationVector = (i: number) => {
  return nerdamer(`
    [a${i-1}, -sin(al${i-1})*d${i}, cos(al${i-1})*d${i}]
  `);
}