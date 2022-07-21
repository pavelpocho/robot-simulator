
import vector from './vector';
import { add, cos, inv, matrix, multiply, sin } from 'mathjs';

export {}

interface AccelCalcData {
  t: number[], td: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number
}

onmessage = (ev: MessageEvent<AccelCalcData>) => {
  const data = ev.data;
  postMessage(manualRRInvDynamics(data));
  
}

const manualRRInvDynamics = ({t, td, torques, L, m, w, FN, g}: AccelCalcData) => {
  // Ranges:
  // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
  // Paper: td1 - td3, Vars: td[1] - td[3]
  // Paper: torques1 - torques3, Vars: torques[1] - torques[3]
  // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)
  // console.log(td);
  const shiftedT = [0, t[0], t[1]];
  const s = shiftedT.map(x => sin(x));
  const c = shiftedT.map(x => cos(x));
  const c12 = cos(shiftedT[1] + shiftedT[2]);
  const s12 = sin(shiftedT[1] + shiftedT[2]);

  const GV_2 = FN[2]+m[2]*L[2]*(c12*g+s[2]*(td[1]**2)*L[1])+L[2]*FN[1];
  const GV_1 = GV_2+m[1]*L[1]*c[1]*g+L[1]*(s[2]*(FN[0]+m[2]*(s12*g-c[2]*(td[1]**2)*L[1]-((td[1]+td[2])**2)*L[2]))+c[2]*(FN[1]+m[2]*(c12*g+s[2]*(td[1]**2)*L[1])));
  // const GV_2 = 0;
  // const GV_1 = 0;

  const M21 = m[2]*L[2]*(c[2]*L[1]+L[2]);
  const M22 = m[2]*(L[2]**2);

  const M11 = M21 + m[1]*(L[1]**2)+(L[1]**2)*m[2]+L[1]*L[2]*m[2]*c[2];
  const M12 = M22 + L[1]*L[2]*m[2]*c[2];

  const MM = matrix([[M11, M12], [M21, M22]]);
  const invMM = inv(MM);

  // console.log("GV vector");
  // console.log(vector([GV_1, GV_2]));
  // console.log("MM");
  // console.log(matrix([[M11, M12], [M21, M22]]));
  
  return multiply(invMM, add(vector([torques[1], torques[2]]), add(vector([-GV_1, -GV_2]), vector([-td[1] * 1.5, -td[2] * 1.5]))));
}

const manualRInvDynamics = ({t, td, torques, L, m, w, FN, g}: AccelCalcData) => {
  // Ranges:
  // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
  // Paper: td1 - td3, Vars: td[1] - td[3]
  // Paper: torques1 - torques3, Vars: torques[1] - torques[3]
  // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)
  // console.log(td);
  const shiftedT = [0, t[0]];
  const s = shiftedT.map(x => sin(x));
  const c = shiftedT.map(x => cos(x));
  
  return (torques[1] - L[1]*m[1]*c[1]*g) / ((L[1]**2)*m[1]);
}