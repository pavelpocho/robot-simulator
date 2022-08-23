import nerdamer from 'nerdamer';
import { Robot } from './contexts/RobotContext';

onmessage = ({ data: { robot, jacobian } }: MessageEvent<{ robot: Robot, jacobian: string[][] }>) => {

  for (let i = 0; i < robot.dhTable.length; i++) {
    const a = `a${i}`;
    const al = `al${i}`;
    nerdamer.setVar(a, robot.dhTable[i].a_i_minus_1);
    nerdamer.setVar(al, robot.dhTable[i].alpha_i_minus_1);
  }
  
  const completeJacobian = nerdamer(`matrix(${jacobian.map(jRow => `[${jRow.map(j => j).join(', ')}]`).join(', ')})`);
  const doubledRotationMatrices = robot.dhTable.map((_, i) => nerdamer(getSymbolicDoubledRotationMatrix(i+1)));
  const downToZeroRotMat = nerdamer(doubledRotationMatrices.slice(0, robot.type.length).map(r => `(${r.text('fractions')})`).join('*'));
  const convertedJacobian = nerdamer(`${downToZeroRotMat.text('fractions')}*${completeJacobian.text('fractions')}`);
  postMessage(convertedJacobian.text('fractions').replace('matrix(', 'matrix([').slice(0, -1).concat('])'));
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