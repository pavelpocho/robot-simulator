import { add, cos, inv, matrix, multiply, sin } from "mathjs";
import nerdamer from "nerdamer";
import { AccelCalcData } from "./useKinematicInfo";
import vector from "./vector";

export const manualRRFwdDynamics = (t: number[], td: number[], tdd: number[], L: number[], m: number[], w: number[], FN: number[], g: number) => {
  // Ranges:
  // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
  // Paper: td1 - td3, Vars: td[1] - td[3]
  // Paper: tdd1 - tdd3, Vars: tdd[1] - tdd[3]
  // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)
  const shiftedT = [0, t[0], t[1]];
  const s = shiftedT.map(x => sin(x));
  const c = shiftedT.map(x => cos(x));
  const c12 = cos(shiftedT[1] + shiftedT[2]);
  const s12 = sin(shiftedT[1] + shiftedT[2]);

  const n_2 = FN[2]+m[2]*L[2]*(c12*g+s[2]*(td[1]**2)*L[1]+c[2]*tdd[1]*L[1]+(tdd[1]+tdd[2])*L[2])+L[2]*FN[1];
  const n_1 = n_2 + m[1]*L[1]*(c[1]*g+tdd[1]*L[1])+L[1]*(s[2]*(FN[0]+m[2]*(s12*g-c[2]*(td[1]**2)*L[1]+s[2]*tdd[1]*L[1]-((td[1]+td[2])**2)*L[2]))+c[2]*(FN[1]+m[2]*(c12*g+s[2]*(td[1]**2)*L[1]+c[2]*tdd[1]*L[1]+(tdd[1]+tdd[2])*L[2])))

  const GV_2 = FN[2]+m[2]*L[2]*(c12*g+s[2]*(td[1]**2)*L[1])+L[2]*FN[1];
  const GV_1 = GV_2 + m[1]*L[1]*c[1]*g+L[1]*(s[2]*(FN[0]+m[2]*(s12*g-c[2]*(td[1]**2)*L[1]-((td[1]+td[2])**2)*L[2]))+c[2]*(FN[1]+m[2]*(c12*g+s[2]*(td[1]**2)*L[1])));

  const M21 = m[2]*L[2]*(c[2]*L[1]+L[2]);
  const M22 = m[2]*(L[2]**2);

  const M11 = M21 + m[1]*(L[1]**2)+(L[1]**2)*m[2]+L[1]*L[2]*m[2]*c[2];
  const M12 = M22 + L[1]*L[2]*m[2]*c[2];

  console.log("Manual separated");
  const n_s = add(multiply(matrix([[M11, M12], [M21, M22]]), vector([tdd[1], tdd[2]])), vector([GV_1, GV_2]));
  console.log("GV vector");
  console.log(vector([GV_1, GV_2]));
  console.log("MM");
  console.log(matrix([[M11, M12], [M21, M22]]));

  manualRRFwdDynamicsCorrect(t, td, tdd, L, m, w, FN, g);

  // console.log("Manual");
  // console.log([n_1, n_2]);
  return vector([n_1, n_2]);
}

export const manualRRFwdDynamicsCorrect = (t: number[], td: number[], tdd: number[], L: number[], m: number[], w: number[], FN: number[], g: number) => {
  // Ranges:
  // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
  // Paper: td1 - td3, Vars: td[1] - td[3]
  // Paper: tdd1 - tdd3, Vars: tdd[1] - tdd[3]
  // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)
  const shiftedT = [0, t[0], t[1]];
  const s = shiftedT.map(x => sin(x));
  const c = shiftedT.map(x => cos(x));
  const c12 = cos(shiftedT[1] + shiftedT[2]);
  const s12 = sin(shiftedT[1] + shiftedT[2]);

  const n_2 = m[2]*c[2]*tdd[1]*L[1]*L[2]+m[2]*s[2]*(td[1]**2)*L[1]*L[2]+m[2]*c12*g*L[2]+m[2]*(L[2]**2)*(tdd[1]+tdd[2]);
  const n_1 = m[2]*(L[2]**2)*(tdd[1]+tdd[2])+m[2]*c[2]*L[1]*L[2]*(2*tdd[1]+tdd[2])+(m[1]+m[2])*(L[1]**2)*tdd[1]-m[2]*s[2]*L[1]*L[2]*(td[2]**2)-2*m[2]*s[2]*L[1]*L[2]*td[1]*td[2]+m[2]*c12*L[2]*g+(m[1]+m[2])*c[1]*L[1]*g;

  console.log("Correct stuff");
  console.log(n_1, n_2);

  return vector([n_1, n_2]);
}

export const manualRRInvDynamics = (t: number[], td: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number) => {
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

export class VelocityCalculator {

  doneSpeedPart;
  i;
  interval;
  prevAcceleration;
  secondPrevAcceleration;

  constructor(interval: number) {
    this.doneSpeedPart = 0;
    this.i = 0;
    this.interval = interval;
    this.prevAcceleration = 0;
    this.secondPrevAcceleration = 0;
  }

  getNextSpeed(acceleration: number) {
    var speed;
    if (this.i > 2) {
      this.doneSpeedPart += (this.interval / 3) * ((this.i % 2 == 1) ? 4 : 2) * this.secondPrevAcceleration;
    }
  
    if (this.i == 0) {
      speed = this.doneSpeedPart;
    }
    else if (this.i == 1) {
      speed = this.doneSpeedPart + ((this.interval / 3) * (acceleration));
    }
    else {
      speed = this.doneSpeedPart + ((this.interval / 3) * (4 * this.prevAcceleration + acceleration));
    }

    this.secondPrevAcceleration = this.prevAcceleration;
    this.prevAcceleration = acceleration;
    this.i++;

    return speed;
  }

}

export const manualRInvDynamics = ({t, td, torques, L, m, w, FN, g}: AccelCalcData) => {
  // Ranges:
  // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
  // Paper: td1 - td3, Vars: td[1] - td[3]
  // Paper: torques1 - torques3, Vars: torques[1] - torques[3]
  // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)
  // console.log(td);
  const shiftedT = [0, t[0]];
  const s = shiftedT.map(x => sin(x));
  const c = shiftedT.map(x => cos(x));
  
  // return (torques[1] - L[1]*m[1]*c[1]*g) / ((L[1]**2)*m[1]);
  return c[1]*g
}

export const simpsonsIntegral = (i: number, acceleration: number, prevAcceleration: number, secondPrevAcceleration: number, doneSpeedPart: number, interval: number) => {
  var speed;
  if (i > 2) {
    doneSpeedPart += (interval / 3) * ((i % 2 == 1) ? 4 : 2) * secondPrevAcceleration;
  }

  if (i == 0) {
    return doneSpeedPart;
  }
  else if (i == 1) {
    return doneSpeedPart + ((interval / 3) * (acceleration));
  }
  else {
    return doneSpeedPart + ((interval / 3) * (4 * prevAcceleration + acceleration));
  }
}

export const symbolicRRFwdDynamics = (t: number[], td: number[], tdd: number[], L: number[], m: number[], w: number[], FN: number[], g: number) => {
  nerdamer.setVar('R01', 'matrix([cos(theta_0), -sin(theta_0), 0], [sin(theta_0), cos(theta_0), 0], [0, 0, 1])');
  nerdamer.setVar('R12', 'matrix([cos(theta_1), -sin(theta_1), 0], [sin(theta_1), cos(theta_1), 0], [0, 0, 1])');
  nerdamer.setVar('R23', 'matrix([cos(theta_2), -sin(theta_2), 0], [sin(theta_2), cos(theta_2), 0], [0, 0, 1])');
  nerdamer.setVar('R34', 'matrix([1, 0, 0], [0, 1, 0], [0, 0, 1])');

  nerdamer.setVar('R10', 'transpose(R01)');
  nerdamer.setVar('R21', 'transpose(R12)');
  nerdamer.setVar('R32', 'transpose(R23)');
  nerdamer.setVar('R43', 'transpose(R34)');

  nerdamer.setVar('omega_0', 'matrix([0], [0], [0])');
  nerdamer.setVar('v_0', 'matrix([0], [0], [0])');
  nerdamer.setVar('omega_dot_0', 'matrix([0], [0], [0])')
  nerdamer.setVar('v_dot_0', 'matrix([0], [g], [0])');
  nerdamer.setConstant('L0', 0);

  for (var i = 1; i <= 2; i++) {
    nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[theta_dot_${i}]))`);
    const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
    nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);

    nerdamer.setVar(`omega_dot_${i}`, `(R${i}${i-1}*omega_dot_${i-1})+(matrix([0], [0], [theta_dot_dot_${i}]))`);
    const vectorizedOmegaDot = nerdamer(`[matget(omega_dot_${i-1}, 0, 0), matget(omega_dot_${i-1}, 1, 0), matget(omega_dot_${i-1}, 2, 0)]`).text();
    nerdamer.setVar(`v_dot_${i}`, `(R${i}${i-1})*((cross(${vectorizedOmegaDot}, [L${i-1}, 0, 0]))+(cross(${vectorizedOmega}, cross(${vectorizedOmega}, [L${i-1}, 0, 0])))+(v_dot_${i-1}))`);

    // nerdamer.setVar(`I_${i}`, `matrix([(m_${i}/12)*(((w_${i})^2)+((h_${i})^2)), 0, 0], [0, (m_${i}/12)*(((L${i}/2)^2)+((h_${i})^2)), 0], [0, 0, (m_${i}/12)*(((L${i}/2)^2)+((w_${i})^2))])`);
    nerdamer.setVar(`I_${i}`, '0');
    const vectorizedOmegaI = nerdamer(`[matget(omega_${i}, 0, 0), matget(omega_${i}, 1, 0), matget(omega_${i}, 2, 0)]`).text();
    const vectorizedOmegaIDot = nerdamer(`[matget(omega_dot_${i}, 0, 0), matget(omega_dot_${i}, 1, 0), matget(omega_dot_${i}, 2, 0)]`).text();
    nerdamer.setVar(`vc_dot_${i}`, `(cross(${vectorizedOmegaIDot}, [L${i}, 0, 0]))+(cross(${vectorizedOmegaI}, cross(${vectorizedOmegaI}, [L${i}, 0, 0])))+v_dot_${i}`);

    nerdamer.setVar(`F_${i}`, `m_${i}*vc_dot_${i}`);
    const vectorizedITimesOmega = nerdamer(`[matget((I_${i}*omega_${i}), 0, 0), matget((I_${i}*omega_${i}), 1, 0), matget((I_${i}*omega_${i}), 2, 0)]`);
    nerdamer.setVar(`N_${i}`, `(I_${i}*omega_dot_${i})+(cross(${vectorizedOmegaI}, ${vectorizedITimesOmega}))`);
  }

  for (var i = 2; i >= 1; i--) {

    if (i === 2) {
      nerdamer.setVar(`f_${i}`, `(R${i}${i+1}*(matrix([eefX], [eefY], [0])))+(F_${i})`);
      const vectorizedFI = nerdamer(`[matget(F_${i}, 0, 0), matget(F_${i}, 1, 0), matget(F_${i}, 2, 0)]`).text();
      const vectorizedRf = nerdamer(`[matget((R${i}${i+1})*matrix([eefX], [eefY], [0]), 0, 0), matget((R${i}${i+1})*matrix([eefX], [eefY], [0]), 1, 0), matget((R${i}${i+1})*matrix([eefX], [eefY], [0]), 2, 0)]`).text();
      nerdamer.setVar(`n_${i}`, `(N_${i})+((R${i}${i+1})*(matrix([0], [0], [eenZ])))+(cross([L${i}, 0, 0], ${vectorizedFI}))+(cross([L${i}, 0, 0], ${vectorizedRf}))`)
    }
    else {
      nerdamer.setVar(`f_${i}`, `(R${i}${i+1}*f_${i+1})+(F_${i})`);
      const vectorizedFI = nerdamer(`[matget(F_${i}, 0, 0), matget(F_${i}, 1, 0), matget(F_${i}, 2, 0)]`).text();
      const vectorizedRf = nerdamer(`[matget((R${i}${i+1})*f_${i+1}, 0, 0), matget((R${i}${i+1})*f_${i+1}, 1, 0), matget((R${i}${i+1})*f_${i+1}, 2, 0)]`).text();
      nerdamer.setVar(`n_${i}`, `(N_${i})+((R${i}${i+1})*(n_${i+1}))+(cross([L${i}, 0, 0], ${vectorizedFI}))+(cross([L${i}, 0, 0], ${vectorizedRf}))`)
    }
  }


  const num_n2 = nerdamer(`matget(n_2, 2, 0)`);
  const num_n1 = nerdamer(`matget(n_1, 2, 0)`);
  const nn_1 = nerdamer(num_n1, { 
    theta_0: t[0].toString(), theta_1: t[1].toString(),
    theta_dot_1: td[1].toString(), theta_dot_2: td[2].toString(),
    theta_dot_dot_1: td[1].toString(), theta_dot_dot_2: tdd[2].toString(),
    L1: L[1].toString(), L2: L[2].toString(), m_1: m[1].toString(), m_2: m[2].toString(),
    w_1: w[1].toString(), w_2: w[2].toString(), g: g.toString(),
    eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
  }).evaluate().text('decimals');
  const nn_2 = nerdamer(num_n2, { 
    theta_0: t[0].toString(), theta_1: t[1].toString(),
    theta_dot_1: td[1].toString(), theta_dot_2: td[2].toString(),
    theta_dot_dot_1: td[1].toString(), theta_dot_dot_2: tdd[2].toString(),
    L1: L[1].toString(), L2: L[2].toString(), m_1: m[1].toString(), m_2: m[2].toString(),
    w_1: w[1].toString(), w_2: w[2].toString(), g: g.toString(),
    eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
  }).evaluate().text('decimals');
  return vector([parseFloat(nn_1), parseFloat(nn_2)]);
}