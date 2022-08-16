import math, { cos, sin, matrix, multiply, pow, atan2, Matrix, transpose, add, cross, sum, inv, sign, evaluate, compile } from "mathjs";
import vector from "../utils/vector";
import nerdamer from 'nerdamer';
import { DHTableRow } from "../utils/useKinematicInfo";

interface TwoDRobotInitData {
  robotType: string,
  jointPositions: number[],
  linkLengths: number[],
}

interface RobotType {
  name: string,
  jointTypes: ('P'|'R')[],
}

export const RPR_2D_Robot_Type: RobotType = {
  name: "RPR",
  jointTypes: ["R", "P", "R"]
}
export const RRR_2D_Robot_Type: RobotType = {
  name: "RRR",
  jointTypes: ["R", "R", "R"]
}
export const RR_2D_Robot_Type: RobotType = {
  name: "RR",
  jointTypes: ["R", "R"]
}
export const R_2D_Robot_Type: RobotType = {
  name: "R",
  jointTypes: ["R"]
}
export const RRPR_2D_Robot_Type: RobotType = {
  name: "RRPR",
  jointTypes: ["R", "R", "P", "R"]
}
export const P_2D_Robot_Type: RobotType = {
  name: "P",
  jointTypes: ["P"]
}

interface LinkParametersInitData {
  i: number
  a_i_minus_1: number,
  alpha_i_minus_1: number,
  d_i: number,
  theta_i: number
}

class LinkParameters {

  i: number
  a_i_minus_1: number;
  alpha_i_minus_1: number;
  d_i: number;
  theta_i: number;

  constructor({ i, a_i_minus_1, alpha_i_minus_1, d_i, theta_i }: LinkParametersInitData) {
    this.i = i;
    this.a_i_minus_1 = a_i_minus_1;
    this.alpha_i_minus_1 = alpha_i_minus_1;
    this.d_i = d_i;
    this.theta_i = theta_i;
  }
  
  s(a: number) {
    return sin(a);
  }

  c(a: number) {
    return cos(a);
  }

  // Gets the transformation matrix between frame i-1 and frame i
  getTransformationMatrix() {
    let t = this.theta_i;
    let al = this.alpha_i_minus_1;
    let d = this.d_i;
    return matrix([
      [this.c(t), -this.s(t), 0, this.a_i_minus_1],
      [this.s(t)*this.c(al), this.c(t)*this.c(al), -this.s(al), -this.s(al)*d],
      [this.s(t)*this.s(al), this.c(t)*this.s(al), this.c(al), this.c(al)*d],
      [0, 0, 0, 1]
    ])
  }

  getMathJaxTMSubstituted() {
    const j = this.i + 1;
    const theta_i = this.theta_i.toFixed(2);
    const alpha_i_min_1 = this.alpha_i_minus_1.toFixed(2);
    const d_i = this.d_i.toFixed(2);
    const a_i_min_1 = this.a_i_minus_1.toFixed(2);
    return String.raw`{_${j}^{${j-1}}}T=\left[ \begin{array}{ccc}c(${theta_i}) & -s(${theta_i}) & 0 & ${a_i_min_1} \\ s(${theta_i})c(${alpha_i_min_1}) & c(${theta_i})c(${alpha_i_min_1}) & -s(${alpha_i_min_1}) & -s(${alpha_i_min_1})${d_i} \\ s(${theta_i})s(${alpha_i_min_1}) & c(${theta_i})s(${alpha_i_min_1}) & c(${alpha_i_min_1}) & c(${alpha_i_min_1})${d_i} \\ 0 & 0 & 0 & 1\end{array} \right]`
  }

  getMathJaxTMSolved() {
    const j = this.i + 1;
    return String.raw`{_${j}^{${j-1}}}T=\left[ \begin{array}{ccc}${cos(this.theta_i).toFixed(2)} & ${-sin(this.theta_i).toFixed(2)} & 0 & ${this.a_i_minus_1} \\ ${(sin(this.theta_i)*cos(this.alpha_i_minus_1)).toFixed(2)} & ${(cos(this.theta_i)*cos(this.alpha_i_minus_1)).toFixed(2)} & ${(-sin(this.alpha_i_minus_1)).toFixed(2)} & ${(-sin(this.alpha_i_minus_1)*this.d_i).toFixed(2)} \\ ${(sin(this.theta_i)*sin(this.alpha_i_minus_1)).toFixed(2)} & ${(cos(this.theta_i)*sin(this.alpha_i_minus_1)).toFixed(2)} & ${(cos(this.alpha_i_minus_1)).toFixed(2)} & ${(cos(this.alpha_i_minus_1)*this.d_i).toFixed(2)} \\ 0 & 0 & 0 & 1\end{array} \right]`;
  }

  getRotationMatrix() {
    let t = this.theta_i;
    let al = this.alpha_i_minus_1;
    let d = this.d_i;
    return matrix([
      [this.c(t), -this.s(t), 0],
      [this.s(t)*this.c(al), this.c(t)*this.c(al), -this.s(al)],
      [this.s(t)*this.s(al), this.c(t)*this.s(al), this.c(al)]
    ]);
  }

}

export default class TwoDRobot {

  numOfJoints: number;
  robotTypeName: string;
  linkParametersArray: LinkParameters[];
  jointValues: number[];
  linkLengths: number[];

  last_u1: number = 0;
  last_u2: number = 0;
  last_u3: number = 0;
  last_u4: number = 0;
  last_u5: number = 0;
  last_u6: number = 0;
  logged: boolean = false;
  integral: number[] = [0, 0, 0];

  constructor({ robotType, jointPositions: jointValues, linkLengths }: TwoDRobotInitData) {
    this.robotTypeName = robotType;
    this.linkLengths = linkLengths;
    this.numOfJoints = robotType.length;
    this.linkParametersArray = [];
    this.jointValues = [];
    this.setJointValues(jointValues);
  }

  getJointValues() {
    return this.jointValues;
  }

  getLinkLengths() {
    return this.linkLengths;
  }

  getJacobian(joint_angles: number[], L: number[]) {
    const c_123 = cos(sum(joint_angles));
    const s_123 = sin(sum(joint_angles));
    const c_23 = cos(joint_angles[1] + joint_angles[2]);
    const s_23 = sin(joint_angles[1] + joint_angles[2]);
    const j_11 = L[1]*s_23+L[2]*sin(joint_angles[2]);
    const j_21 = L[1]*c_23+L[2]*cos(joint_angles[2])+L[3];
    const j_12 = L[2]*sin(joint_angles[2]);
    const j_22 = L[2]*cos(joint_angles[2])+L[3];
    const j_23 = L[3];
    if (this.robotTypeName === 'RRR') {
      return matrix([
        [c_123*j_11-s_123*j_21, c_123*j_12-s_123*j_22, -s_123*j_23],
        [s_123*j_11+c_123*j_21, s_123*j_12+c_123*j_22, c_123*j_23],
        [1,1,1]
      ]);
    }
    else {
      throw Error("Not RRR, can't get Jacobian");
    }
  }

  getInverseJacobian(joint_angles: number[], L: number[]) {
    const jacobian = this.getJacobian(joint_angles, L);
    return inv(jacobian);
  }

  setDhParameters(dhTable: DHTableRow[], jointPositions: number[], robotType: string) {
    const linkParametersArray: LinkParameters[] = [];
    dhTable.forEach((dhRow, i) => {
      linkParametersArray.push(new LinkParameters({
        i, a_i_minus_1: dhRow.a_imin1, alpha_i_minus_1: dhRow.alpha_imin1 / 180 * Math.PI, d_i: robotType[i] === 'P' ? jointPositions[i] : dhRow.d_i, theta_i: robotType[i] === 'R' ? jointPositions[i] / 180 * Math.PI : dhRow.theta_i / 180 * Math.PI
      }));
    });
    this.linkParametersArray = linkParametersArray;
  }

  setJointValues(jointValues: number[]) {
    this.jointValues = jointValues;
    const linkParametersArray: LinkParameters[] = [];
    for (let i = 0; i < jointValues.length; i++) {
      // Nope, this is complicated af
      if (this.robotTypeName[i] === 'R') {
        if (this.robotTypeName[i - 1] === 'R') {
          linkParametersArray.push(new LinkParameters({
            i, a_i_minus_1: this.linkLengths[i], alpha_i_minus_1: 0, d_i: 0, theta_i: jointValues[i]
          }));
        }
        else {
          linkParametersArray.push(new LinkParameters({
            i, a_i_minus_1: 0, alpha_i_minus_1: - Math.PI / 2, d_i: 0, theta_i: jointValues[i]
          }));
        }
      }
      else if (this.robotTypeName[i] === 'P') {
        if (this.robotTypeName[i - 1] === 'R') {
          linkParametersArray.push(new LinkParameters({
            i, a_i_minus_1: 0, alpha_i_minus_1: Math.PI / 2, d_i: jointValues[i], theta_i: 0
          }));
        }
        else {
          linkParametersArray.push(new LinkParameters({
            i, a_i_minus_1: this.linkLengths[i], alpha_i_minus_1: 0, d_i: jointValues[i], theta_i: 0
          }));
        }
      }
    }
    linkParametersArray.push(new LinkParameters({
      i: jointValues.length, a_i_minus_1: this.linkLengths[jointValues.length - 1 + 1], alpha_i_minus_1: 0, d_i: 0, theta_i: 0
    }))
    this.linkParametersArray = linkParametersArray;
    // this.linkParametersArray = [...Array(this.numOfJoints).keys()].map(i => new LinkParameters({
    //   a_i_minus_1: this.jointTypes[i] == 'P' ? 0 : this.linkLengths[i],
    //   alpha_i_minus_1: this.jointTypes[i] == 'P' ? Math.PI / 2 : 0,
    //   d_i: this.jointTypes[i] == 'P' ? jointValues[i] : 0,
    //   theta_i: this.jointTypes[i] == 'R' ? jointValues[i] : 0
    // }));
  }

  forwardKinematics(toLink: number) {
    if (toLink >= this.numOfJoints + 1) return null;
    let transformMatrices = this.linkParametersArray.slice(0, toLink + 1).map(l => l.getTransformationMatrix());
    let totalTransform = transformMatrices.reduce((acc, value) => {
      return multiply(acc, value);
    }, matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]));
    return totalTransform;
  }

  inverseKinematicsRRR(x: number, y: number, a: number) {
    // This is the offset in the fwd kin
    let y_corrected = y;
    let ee_dist_x = this.linkLengths[3] * cos(a);
    let ee_dist_y = this.linkLengths[3] * sin(a);
    let xT = x - ee_dist_x;
    let yT = y_corrected - ee_dist_y;

    let c_theta_2 = (Math.pow(xT, 2) + Math.pow(yT, 2) - Math.pow(this.linkLengths[1], 2) - Math.pow(this.linkLengths[2], 2)) / (2 * this.linkLengths[1] * this.linkLengths[2]);
    let s_theta_2 = Math.sqrt(1-Math.pow(c_theta_2, 2));

    let t_2 = atan2(s_theta_2, c_theta_2);
    
    let k_1 = this.linkLengths[1] + this.linkLengths[2]*c_theta_2;
    let k_2 = this.linkLengths[2]*s_theta_2;

    let t_1 = atan2(yT, xT) - atan2(k_2, k_1);
    let t_3 = a - t_1 - t_2;
    
    return [t_1, t_2, t_3];
  }

  forwardKinematicsOneLink(toLink: number) {
    if (toLink > this.numOfJoints + 1) return null;

    let transformMatrices = [];
    if (toLink == 0) {
      transformMatrices.push(matrix([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]))
    }
    else {
      transformMatrices = this.linkParametersArray.slice(toLink - 1, toLink).map(l => l.getTransformationMatrix());
    }
    return transformMatrices[0];
  }

  getCompiledJacobian(robotType: string, joint_angles: number[]) {
    
  }

  getGeneralJacobian(joint_angles: number[], L: number[], code: math.EvalFunction) {
    // nerdamer.setVar('R01', 'matrix([cos(theta_0), -sin(theta_0), 0], [sin(theta_0), cos(theta_0), 0], [0, 0, 1])');
    // nerdamer.setVar('R12', 'matrix([cos(theta_1), -sin(theta_1), 0], [sin(theta_1), cos(theta_1), 0], [0, 0, 1])');
    // nerdamer.setVar('R23', 'matrix([cos(theta_2), -sin(theta_2), 0], [sin(theta_2), cos(theta_2), 0], [0, 0, 1])');
    // nerdamer.setVar('R34', 'matrix([1, 0, 0], [0, 1, 0], [0, 0, 1])');

    // nerdamer.setVar('R10', 'transpose(R01)');
    // nerdamer.setVar('R21', 'transpose(R12)');
    // nerdamer.setVar('R32', 'transpose(R23)');
    // nerdamer.setVar('R43', 'transpose(R34)');

    // nerdamer.setVar('omega_0', 'matrix([0], [0], [0])');
    // nerdamer.setVar('v_0', 'matrix([0], [0], [0])');
    // nerdamer.setConstant('L0', 0);

    // for (var i = 1; i <= 4; i++) {
    //   if (i == 4) {
    //     nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[0]))`);
    //     const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
    //     nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);
    //   }
    //   else {
    //     nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[theta_dot_${i-1}]))`);
    //     const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
    //     nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);
    //   }
    // }

    // const v_4 = nerdamer.getVars('text')['v_4'];
    // const omega_4 = nerdamer.getVars('text')['omega_4'];
    // const ja = [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']];
    // for (var i = 1; i < 4; i++) {
    //   for (var j = 0; j < 3; j++) {
    //     const x = nerdamer(`expand(matget(${j === 2 ? omega_4 : v_4}, ${j}, 0))`)
    //       .text()
    //       .split('+')
    //       .filter(x => x.includes(`theta_dot_${i - 1}`))
    //       .map(x => x.replace(`theta_dot_${i - 1}`, '1'))
    //       .join('+');
    //     if (x != '') ja[i-1][j] = x;
    //   }
    // }
    // const jacobian = nerdamer(`matrix([(${ja[0][0]}), (${ja[0][1]}), (${ja[0][2]})], [(${ja[1][0]}), (${ja[1][1]}), (${ja[1][2]})], [(${ja[2][0]}), (${ja[2][1]}), (${ja[2][2]})])`);
    // const jacobian = nerdamer('matrix([L1*cos(theta_1)*sin(theta_2)+L1*cos(theta_2)*sin(theta_1)+L2*sin(theta_2),-L1*sin(theta_1)*sin(theta_2)+L1*cos(theta_1)*cos(theta_2)+L2*cos(theta_2)+L3,1],[L2*sin(theta_2),L2*cos(theta_2)+L3,1],[0,L3,1])');
    // const solvedJacobian = nerdamer(jacobian, { theta_0: joint_angles[0].toString(), theta_1: joint_angles[1].toString(), theta_2: joint_angles[2].toString(), L0: L[0].toString(), L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString() });
    // const solvedDownToZero = nerdamer(`matrix([cos(theta_0 + theta_1 + theta_2), sin(theta_0 + theta_1 + theta_2), 0], [-sin(theta_0 + theta_1 + theta_2), cos(theta_0 + theta_1 + theta_2), 0], [0, 0, 1])`, { theta_0: joint_angles[0].toString(), theta_1: joint_angles[1].toString(), theta_2: joint_angles[2].toString() });
    // const genJacobian = nerdamer(`${jacobian.text('decimals')}*${solvedDownToZero.text('decimals')}`);
    const scope = {
      L1: L[1],
      L2: L[2],
      L3: L[3],
      theta_0: joint_angles[0],
      theta_1: joint_angles[1],
      theta_2: joint_angles[2],
    }
    
    const genJacobian = code.evaluate(scope);
    return transpose(genJacobian);
    // console.log(genJacobian.text('fractions'));
    // console.log(eval(nerdamer(`matget(${genJacobian}, 0, 0)`).text('fractions')));
    // console.log(evaluate(nerdamer(`matget(${genJacobian}, 0, 0)`).text('fractions')));
    // console.log(nerdamer(`matget(${genJacobian}, 0, 0)`).text('fractions'));
    // return matrix([
    //   [
    //     parseFloat(nerdamer(`matget(${genJacobian}, 0, 0)`).evaluate().text('decimals')),
    //     parseFloat(nerdamer(`matget(${genJacobian}, 1, 0)`).evaluate().text('decimals')),
    //     parseFloat(nerdamer(`matget(${genJacobian}, 2, 0)`).evaluate().text('decimals')),
    //   ],
    //   [
    //     parseFloat(nerdamer(`matget(${genJacobian}, 0, 1)`).evaluate().text('decimals')),
    //     parseFloat(nerdamer(`matget(${genJacobian}, 1, 1)`).evaluate().text('decimals')),
    //     parseFloat(nerdamer(`matget(${genJacobian}, 2, 1)`).evaluate().text('decimals')),
    //   ],
    //   [
    //     parseFloat(nerdamer(`matget(${genJacobian}, 0, 2)`).evaluate().text('decimals')),
    //     parseFloat(nerdamer(`matget(${genJacobian}, 1, 2)`).evaluate().text('decimals')),
    //     parseFloat(nerdamer(`matget(${genJacobian}, 2, 2)`).evaluate().text('decimals')),
    //   ],
    // ]);
  }

  // getInverseGeneralJacobian(joint_angles: number[], L: number[]) {
  //   const jacobian = this.getGeneralJacobian(joint_angles, L);
  //   return inv(jacobian);
  // }

  getRRRDynamicsVector(u: number[], g: number, torques: number[], timestep: number, m: number[], L: number[], w: number[], f_c_static: number[], f_c_dynamic: number[], f_v: number[], FN: number[]) {
    const c123 = cos(u[1] + u[3] + u[5]);
    const c12 = cos(u[1] + u[3]);
    const c23 = cos(u[3] + u[5]);
    const c1 = cos(u[1]);
    const c2 = cos(u[3]);
    const c3 = cos(u[5]);

    const s23 = sin(u[3] + u[5]);
    const s3 = sin(u[5]);
    const s2 = sin(u[3]);

    const G3 = 1/2*L[3]*m[3]*c123*g;
    const G2 = G3 + L[2]*c12*g*(1/2*m[2]+m[3]);
    const G1 = G2 + L[1]*c1*g*(1/2*m[1]+m[2]+m[3]);

    const V3 = 1/2*L[3]*m[3]*(s23*L[1]*(u[2]**2)+s3*L[2]*((u[2]+u[4])**2))+FN[2]+L[3]*FN[1];
    const V2 = V3 + 1/2*L[2]*m[2]*s2*L[1]*(u[2]**2)+L[2]*(s3*FN[0]+c3*FN[1]+m[3]*(s2*L[1]*(u[2]**2)+1/2*L[3]*(-s3*((u[2]+u[4]+u[6])**2))));
    const V1 = V2 + L[1]*(s23*FN[0]+c23*FN[1]+(m[3]+1/2*m[2])*(-s2*L[2]*((u[2]+u[4])**2))-1/2*m[3]*L[3]*s23*((u[2]+u[4]+u[6])**2));

    const M31 = 1/12*m[3]*((L[3]**2)+(w[3]**2))+1/2*L[3]*m[3]*(c23*L[1]+c3*L[2]+1/2*L[3]);
    const M32 = 1/12*m[3]*((L[3]**2)+(w[3]**2))+1/2*L[3]*m[3]*(c3*L[2]+1/2*L[3]);
    const M33 = 1/12*m[3]*((L[3]**2)+(w[3]**2))+1/2*L[3]*m[3]*(1/2*L[3]);

    const M21 = M31 + 1/12*m[2]*((L[2]**2)+(w[2]**2))+1/2*L[2]*m[2]*(c2*L[1]+1/2*L[2])+L[2]*m[3]*(c2*L[1]+L[2]+1/2*L[3]*c3);
    const M22 = M32 + 1/12*m[2]*((L[2]**2)+(w[2]**2))+1/2*L[2]*m[2]*(1/2*L[2])+L[2]*m[3]*(L[2]+1/2*L[3]*c3);
    const M23 = M33 + 1/2*L[2]*L[3]*m[3]*c3;

    const M11 = M21 + 1/12*m[1]*((L[1]**2)+(w[1]**2))+(L[1]**2)*(1/4*m[1]+m[2]+m[3])+L[1]*((m[3]+1/2*m[2])*c2*L[2]+1/2*m[3]*L[3]*c23);
    const M12 = M22 + L[1]*(c2*L[2]*(m[3]+1/2*m[2])+1/2*m[3]*L[3]*c23);
    const M13 = M23 + 1/2*m[3]*L[3]*L[1]*c23;

    const F3 = (Math.abs(u[6]) > 0.01 ? f_c_dynamic[2] : f_c_static[2])*sign(u[6])+f_v[2]*u[6];
    const F2 = (Math.abs(u[4]) > 0.01 ? f_c_dynamic[1] : f_c_static[1])*sign(u[4])+f_v[1]*u[4];
    const F1 = (Math.abs(u[2]) > 0.01 ? f_c_dynamic[0] : f_c_static[0])*sign(u[2])+f_v[0]*u[2];

    const invM = inv(matrix([[M11, M12, M13], [M21, M22, M23], [M31, M32, M33]]));

    const vect = multiply(invM, (add(add(add(vector([torques[1], torques[2], torques[3]]), vector([-V1, -V2, -V3])), vector([-G1, -G2, -G3])), vector([-F1, -F2, -F3]))));
    return vect;
  }

  getControlTorquesForDynamicsRRR(g: number, tD: number[], tdD: number[], tddD: number[], timestep: number, m: number[], L: number[], w: number[], f_c_static: number[], f_c_dynamic: number[], f_v: number[], FN: number[]) {

    const TDDe = tddD;
    const last_us = [0, this.last_u1, this.last_u2, this.last_u3, this.last_u4, this.last_u5, this.last_u6];
    const TDe = tdD.map((tdd, i) => tdd - last_us[(i+1) * 2])
    const Te = tD.map((td, i) => td - last_us[i*2 + 1]);

    // Finish this by adding the part that should be subtracted
    // You need current and desired speed and to compute the error!!!!!!!!!!!

    this.integral[0] += Te[0] * timestep;
    this.integral[1] += Te[1] * timestep;
    this.integral[2] += Te[2] * timestep;

    const INTEGRAL = this.integral;

    const Kv = 4;
    const Kp = 9;
    const Ki = 0.1;

    const c123 = cos(this.last_u1 + this.last_u3 + this.last_u5);
    const c12 = cos(this.last_u1 + this.last_u3);
    const c1 = cos(this.last_u1);

    const G3 = 1/2*L[3]*m[3]*c123*g;
    const G2 = G3 + L[2]*c12*g*(1/2*m[2]+m[3]);
    const G1 = G2 + L[1]*c1*g*(1/2*m[1]+m[2]+m[3]);

    const G = [G1, G2, G3];

    const torques = Array(3).fill(0).map((_, i) => {
      return TDDe[i] + Kv * TDe[i] + Kp * Te[i] + Ki * INTEGRAL[i] + G[i];
    });
    // console.log(TDDe[0] + Kv * TDe[0] + Kp * Te[0] + Ki * INTEGRAL[0], G[0]);
    return torques;
    
  }

  getPositionsByDynamicsRRR(g: number, torques: number[], timestep: number, m: number[], L: number[], w: number[], f_c_static: number[], f_c_dynamic: number[], f_v: number[], FN: number[]) {

    // FN is 0 based
    // L is 1 based
    // m is 1 based
    // w is 1 based
    // frictions are 0 based
    // torques are 1 based

    const f1 = (u: number[]) => {
      const du1dt = u[2];
      return du1dt;
    }

    const f2 = (u: number[]) => {
      return this.getRRRDynamicsVector(u, g, torques, timestep, m, L, w, f_c_static, f_c_dynamic, f_v, FN).toArray()[0] as number;
    }

    const f3 = (u: number[]) => {
      const du3dt = u[4];
      return du3dt;
    }

    const f4 = (u: number[]) => {
      return this.getRRRDynamicsVector(u, g, torques, timestep, m, L, w, f_c_static, f_c_dynamic, f_v, FN).toArray()[1] as number;
    }

    const f5 = (u: number[]) => {
      const du5dt = u[6];
      return du5dt;
    }

    const f6 = (u: number[]) => {
      return this.getRRRDynamicsVector(u, g, torques, timestep, m, L, w, f_c_static, f_c_dynamic, f_v, FN).toArray()[2] as number;
    }

    const A = [0, 0, 2/9, 1/3, 3/4, 1, 5/6];
    const B = [[], [], [0, 2/9], [0, 1/12, 1/4], [0, 69/128, -243/128, 135/64], [0, -17/12, 27/4, -27/5, 16/15], [0, 65/432, -5/16, 13/16, 4/27, 5/144]];
    const C = [0, 1/9, 0, 9/20, 16/45, 1/12, 0];
    const CH = [0, 47/450, 0, 12/25, 32/225, 1/30, 6/25];
    const CT = [0, -1/150, 0, 3/100, -16/75, -1/20, 6/25];

    // k, f and last_us are 1 based
    // const k = Array(7).fill(Array(5).fill(0));
    const k = [[], [0, 0, 0, 0, 0, 0 ,0], [0, 0, 0, 0, 0, 0 ,0], [0, 0, 0, 0, 0, 0 ,0], [0, 0, 0, 0, 0, 0 ,0], [0, 0, 0, 0, 0, 0 ,0], [0, 0, 0, 0, 0, 0 ,0]];
    const f = [(u: number[]) => 0, f1, f2, f3, f4, f5, f6];
    const last_us = [0, this.last_u1, this.last_u2, this.last_u3, this.last_u4, this.last_u5, this.last_u6];

    for (var i = 1; i <= 6; i++) {
      for (var j = 1; j <= 6; j++) {
        k[i][j] = timestep * f[j](last_us.map((u,l) => {
          return u + Array(i-1).fill(0).map((_,m) => B[i][m+1] * k[m+1][l]).reduce((a,b) => a+b, 0);
        }));
      }
    }
    
    // u_next is base 1
    const u_next = Array(7).fill(0).map((_,i) => last_us[i] + CH[1]*k[1][i] + CH[2]*k[2][i] + CH[3]*k[3][i] + CH[4]*k[4][i] + CH[5]*k[5][i] + CH[6]*k[6][i]);

    this.last_u1 = u_next[1];
    this.last_u2 = u_next[2];
    this.last_u3 = u_next[3];
    this.last_u4 = u_next[4];
    this.last_u5 = u_next[5];
    this.last_u6 = u_next[6];

    return [u_next[1], u_next[3], u_next[5]];

  }

  getPositionsByDynamicsRR(g: number, torques: number[], timestep: number, m: number[], L: number[], w: number[], f_c_static: number[], f_c_dynamic: number[], f_v: number[], FN: number[]) {

    // FN is 0 based
    // L is 1 based
    // m is 1 based
    // w is 1 based
    // frictions are 0 based
    // torques are 1 based

    const f1 = (u: number[]) => {
      const du1dt = u[2];
      return du1dt;
    }
    const f2 = (u: number[]) => {
      const c1 = cos(u[1]);
      const c2 = cos(u[3]);
      const s1 = sin(u[1]);
      const s2 = sin(u[3]);
      const c12 = cos(u[1] + u[3]);

      const G2 = 1/2*L[2]*m[2]*c12*g;
      const V2 = FN[2]+1/2*L[2]*m[2]*s2*L[1]*(u[2]**2)+L[2]*FN[1];
      const G1 = G2+L[1]*c1*g*(1/2*m[1]+m[2]);
      const V1 = V2+L[1]*(s2*FN[0]+c2*FN[1])-1/2*L[1]*m[2]*s2*L[2]*((u[2]+u[4])**2);
      const F2 = (Math.abs(u[4]) > 0.01 ? f_c_dynamic[1] : f_c_static[1])*sign(u[4])+f_v[1]*u[4];
      const F1 = (Math.abs(u[2]) > 0.01 ? f_c_dynamic[0] : f_c_static[0])*sign(u[2])+f_v[0]*u[2];

      const M21 = m[2]/12*((L[2]**2)+(w[2]**2))+1/2*L[2]*m[2]*(c2*L[1]+1/2*L[2]);
      const M22 = m[2]/12*((L[2]**2)+(w[2]**2))+1/4*(L[2]**2)*m[2];
      const M11 = M21+m[1]/12*((L[1]**2)+(w[1]**2))+1/4*(L[1]**2)*m[1]+L[1]*m[2]*(L[1]+1/2*c2*L[2]);
      const M12 = M22+1/2*L[1]*L[2]*m[2]*c2;

      const invM = inv(matrix([[M11, M12], [M21, M22]]));
      const du2dt = multiply(invM, add(vector([torques[1], torques[2]]), vector([-(G1+V1), -(G2+V2)])));
      return du2dt.toArray()[0] as number;

      // const du2dt = (torques[1] - V1 - G1 - F1)*(M22/(M11*M22-M12*M21)) + (torques[2] - V2 - G2 - F2)*(-M12/(M11*M22-M12*M21));
      // return du2dt;
    }
    const f3 = (u: number[]) => {
      const du3dt = u[4];
      return du3dt;
    }
    const f4 = (u: number[]) => {
      const c1 = cos(u[1]);
      const c2 = cos(u[3]);
      const s1 = sin(u[1]);
      const s2 = sin(u[3]);
      const c12 = cos(u[1] + u[3]);

      const G2 = 1/2*L[2]*m[2]*c12*g;
      const V2 = FN[2]+1/2*L[2]*m[2]*s2*L[1]*(u[2]**2)+L[2]*FN[1];
      const G1 = G2+L[1]*c1*g*(1/2*m[1]+m[2]);
      const V1 = V2+L[1]*(s2*FN[0]+c2*FN[1])-1/2*L[1]*m[2]*s2*L[2]*((u[2]+u[4])**2);
      const F2 = (Math.abs(u[4]) > 0.01 ? f_c_dynamic[1] : f_c_static[1])*sign(u[4])+f_v[1]*u[4];
      const F1 = (Math.abs(u[2]) > 0.01 ? f_c_dynamic[0] : f_c_static[0])*sign(u[2])+f_v[0]*u[2];

      const M21 = m[2]/12*((L[2]**2)+(w[2]**2))+1/2*L[2]*m[2]*(c2*L[1]+1/2*L[2]);
      const M22 = m[2]/12*((L[2]**2)+(w[2]**2))+1/4*(L[2]**2)*m[2];
      const M11 = M21+m[1]/12*((L[1]**2)+(w[1]**2))+1/4*(L[1]**2)*m[1]+L[1]*m[2]*(L[1]+1/2*c2*L[2]);
      const M12 = M22+1/2*L[1]*L[2]*m[2]*c2;

      const invM = inv(matrix([[M11, M12], [M21, M22]]));
      const du2dt = multiply(invM, add(vector([torques[1], torques[2]]), vector([-(G1+V1), -(G2+V2)])));
      return du2dt.toArray()[1] as number;

      // const du4dt = (torques[1] - V1 - G1 - F1)*(-M21/(M11*M22-M12*M21)) + (torques[2] - V2 - G2 - F2)*(M11/(M11*M22-M12*M21));
      // return du4dt;
    }

    const A = [0, 0, 2/9, 1/3, 3/4, 1, 5/6];
    const B = [[], [], [0, 2/9], [0, 1/12, 1/4], [0, 69/128, -243/128, 135/64], [0, -17/12, 27/4, -27/5, 16/15], [0, 65/432, -5/16, 13/16, 4/27, 5/144]];
    const C = [0, 1/9, 0, 9/20, 16/45, 1/12, 0];
    const CH = [0, 47/450, 0, 12/25, 32/225, 1/30, 6/25];
    const CT = [0, -1/150, 0, 3/100, -16/75, -1/20, 6/25];

    // k, f and last_us are 1 based
    // const k = Array(7).fill(Array(5).fill(0));
    const k = [[], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    const f = [(u: number[]) => 0, f1, f2, f3, f4];
    const last_us = [0, this.last_u1, this.last_u2, this.last_u3, this.last_u4];

    // const k11 = timestep * f1([0, this.last_u1, this.last_u2, this.last_u3, this.last_u4]);
    // const k12 = timestep * f2([0, this.last_u1, this.last_u2, this.last_u3, this.last_u4]);
    // const k13 = timestep * f3([0, this.last_u1, this.last_u2, this.last_u3, this.last_u4]);
    // const k14 = timestep * f4([0, this.last_u1, this.last_u2, this.last_u3, this.last_u4]);

    // const k21 = timestep * f1([0, this.last_u1 + B[2][1] * k11, this.last_u2 + B[2][1] * k12, this.last_u3 + B[2][1] * k13, this.last_u4 + B[2][1] * k14]);
    // const k22 = timestep * f2([0, this.last_u1 + B[2][1] * k11, this.last_u2 + B[2][1] * k12, this.last_u3 + B[2][1] * k13, this.last_u4 + B[2][1] * k14]);
    // const k23 = timestep * f3([0, this.last_u1 + B[2][1] * k11, this.last_u2 + B[2][1] * k12, this.last_u3 + B[2][1] * k13, this.last_u4 + B[2][1] * k14]);
    // const k24 = timestep * f4([0, this.last_u1 + B[2][1] * k11, this.last_u2 + B[2][1] * k12, this.last_u3 + B[2][1] * k13, this.last_u4 + B[2][1] * k14]);

    for (var i = 1; i <= 6; i++) {
      for (var j = 1; j <= 4; j++) {
        k[i][j] = timestep * f[j](last_us.map((u,l) => {
          return u + Array(i-1).fill(0).map((_,m) => B[i][m+1] * k[m+1][l]).reduce((a,b) => a+b, 0);
        }));
      }
    }
    
    // u_next is base 1
    const u_next = Array(5).fill(0).map((_,i) => last_us[i] + CH[1]*k[1][i] + CH[2]*k[2][i] + CH[3]*k[3][i] + CH[4]*k[4][i] + CH[5]*k[5][i] + CH[6]*k[6][i])

    this.last_u1 = u_next[1];
    this.last_u2 = u_next[2];
    this.last_u3 = u_next[3];
    this.last_u4 = u_next[4];

    return [u_next[1], u_next[3]];

  }

  getPositionsByDynamicsR(g: number, torque: number, timestep: number, m1: number, L1: number, static_f: number, viscous_f: number) {

    const f1 = (u1: number, u2: number) => {
      const du1dt = u2;
      return du1dt;
    };

    const f2 = (u1: number, u2: number) => {
      // No friction
      // const du2dt = torque + g * cos(u1)
      const du2dt = (torque - L1 * m1 * cos(u1) * g) / ((L1 ** 2) * m1) -  sign(u2) * static_f - viscous_f * u2
      return du2dt
    }

    // Runge kutta fehlberg method of solving ODEs - https://en.wikipedia.org/wiki/Runge–Kutta–Fehlberg_method

    const A = [0, 0, 2/9, 1/3, 3/4, 1, 5/6];
    const B = [[], [], [0, 2/9], [0, 1/12, 1/4], [0, 69/128, -243/128, 135/64], [0, -17/12, 27/4, -27/5, 16/15], [0, 65/432, -5/16, 13/16, 4/27, 5/144]];
    const C = [0, 1/9, 0, 9/20, 16/45, 1/12, 0];
    const CH = [0, 47/450, 0, 12/25, 32/225, 1/30, 6/25];
    const CT = [0, -1/150, 0, 3/100, -16/75, -1/20, 6/25];

    const k11 = timestep * f1(this.last_u1, this.last_u2);
    const k12 = timestep * f2(this.last_u1, this.last_u2);

    const k21 = timestep * f1(this.last_u1 + B[2][1] * k11, this.last_u2 + B[2][1] * k12)
    const k22 = timestep * f2(this.last_u1 + B[2][1] * k11, this.last_u2 + B[2][1] * k12)

    const k31 = timestep * f1(this.last_u1 + B[3][1] * k11 + B[3][2] * k21, this.last_u2 + B[3][1] * k12 + B[3][2] * k22)
    const k32 = timestep * f2(this.last_u1 + B[3][1] * k11 + B[3][2] * k21, this.last_u2 + B[3][1] * k12 + B[3][2] * k22)

    const k41 = timestep * f1(this.last_u1 + B[4][1] * k11 + B[4][2] * k21 + B[4][3] * k31, this.last_u2 + B[4][1] * k12 + B[4][2] * k22 + B[4][3] * k32)
    const k42 = timestep * f2(this.last_u1 + B[4][1] * k11 + B[4][2] * k21 + B[4][3] * k31, this.last_u2 + B[4][1] * k12 + B[4][2] * k22 + B[4][3] * k32)

    const k51 = timestep * f1(this.last_u1 + B[5][1] * k11 + B[5][2] * k21 + B[5][3] * k31 + B[5][4] * k41, this.last_u2 + B[5][1] * k12 + B[5][2] * k22 + B[5][3] * k32 + B[5][4] * k42)
    const k52 = timestep * f2(this.last_u1 + B[5][1] * k11 + B[5][2] * k21 + B[5][3] * k31 + B[5][4] * k41, this.last_u2 + B[5][1] * k12 + B[5][2] * k22 + B[5][3] * k32 + B[5][4] * k42)

    const k61 = timestep * f1(this.last_u1 + B[6][1] * k11 + B[6][2] * k21 + B[6][3] * k31 + B[6][4] * k41 + B[6][5] * k51, this.last_u2 + B[6][1] * k12 + B[6][2] * k22 + B[6][3] * k32 + B[6][4] * k42 + B[6][5] * k42)
    const k62 = timestep * f2(this.last_u1 + B[6][1] * k11 + B[6][2] * k21 + B[6][3] * k31 + B[6][4] * k41 + B[6][5] * k51, this.last_u2 + B[6][1] * k12 + B[6][2] * k22 + B[6][3] * k32 + B[6][4] * k42 + B[6][5] * k42)

    const u1_next = this.last_u1 + CH[1] * k11 + CH[2] * k21 + CH[3] * k31 + CH[4] * k41 + CH[5] * k51 + CH[6] * k61
    const u2_next = this.last_u2 + CH[1] * k12 + CH[2] * k22 + CH[3] * k32 + CH[4] * k42 + CH[5] * k52 + CH[6] * k62

    this.last_u1 = u1_next;
    this.last_u2 = u2_next;

    return u1_next;

  }

}