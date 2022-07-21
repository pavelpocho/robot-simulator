import { cos, sin, matrix, multiply, pow, atan2, Matrix, transpose, add, cross, sum, inv, sign } from "mathjs";
import vector from "../utils/vector";
import nerdamer from 'nerdamer';

interface TwoDRobotInitData {
  robotType: RobotType,
  jointValues: number[],
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
  a_i_minus_1: number,
  alpha_i_minus_1: number,
  d_i: number,
  theta_i: number
}

class LinkParameters {

  a_i_minus_1: number;
  alpha_i_minus_1: number;
  d_i: number;
  theta_i: number;

  constructor({ a_i_minus_1, alpha_i_minus_1, d_i, theta_i }: LinkParametersInitData) {
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
  jointTypes: ('P'|'R')[];
  robotTypeName: string;
  linkParametersArray: LinkParameters[];
  jointValues: number[];
  linkLengths: number[];

  constructor({ robotType, jointValues, linkLengths }: TwoDRobotInitData) {
    this.jointTypes = robotType.jointTypes;
    this.robotTypeName = robotType.name;
    this.linkLengths = linkLengths;
    this.numOfJoints = robotType.jointTypes.length;
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

  setJointValues(jointValues: number[]) {
    this.jointValues = jointValues;
    const linkParametersArray: LinkParameters[] = [];
    for (let i = 0; i < jointValues.length; i++) {
      if (this.jointTypes[i] === 'R') {
        linkParametersArray.push(new LinkParameters({
          a_i_minus_1: this.linkLengths[i], alpha_i_minus_1: 0, d_i: 0, theta_i: jointValues[i]
        }));
      }
      else if (this.jointTypes[i] === 'P') {
        linkParametersArray.push(new LinkParameters({
          a_i_minus_1: this.linkLengths[i] + jointValues[i], alpha_i_minus_1: 0, d_i: 0, theta_i: 0
        }));
      }
    }
    linkParametersArray.push(new LinkParameters({
      a_i_minus_1: this.linkLengths[jointValues.length - 1 + 1], alpha_i_minus_1: 0, d_i: 0, theta_i: 0
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

  getGeneralJacobian(joint_angles: number[], L: number[]) {
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
    nerdamer.setConstant('L0', 0);

    for (var i = 1; i <= 4; i++) {
      if (i == 4) {
        nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[0]))`);
        const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
        nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);
      }
      else {
        nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[theta_dot_${i}]))`);
        const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
        nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);
      }
    }

    const v_4 = nerdamer.getVars('text')['v_4'];
    const omega_4 = nerdamer.getVars('text')['omega_4'];
    const ja = [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']];
    for (var i = 1; i < 4; i++) {
      for (var j = 0; j < 3; j++) {
        const x = nerdamer(`expand(matget(${j === 2 ? omega_4 : v_4}, ${j}, 0))`)
          .text()
          .split('+')
          .filter(x => x.includes(`theta_dot_${i}`))
          .map(x => x.replace(`theta_dot_${i}`, '1'))
          .join('+');
        if (x != '') ja[i-1][j] = x;
      }
    }
    const jacobian = nerdamer(`matrix([(${ja[0][0]}), (${ja[0][1]}), (${ja[0][2]})], [(${ja[1][0]}), (${ja[1][1]}), (${ja[1][2]})], [(${ja[2][0]}), (${ja[2][1]}), (${ja[2][2]})])`);
    const solvedJacobian = nerdamer(jacobian, { theta_0: joint_angles[0].toString(), theta_1: joint_angles[1].toString(), theta_2: joint_angles[2].toString(), L0: L[0].toString(), L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString() });
    const solvedDownToZero = nerdamer(`matrix([cos(theta_0 + theta_1 + theta_2), -sin(theta_0 + theta_1 + theta_2), 0], [sin(theta_0 + theta_1 + theta_2), cos(theta_0 + theta_1 + theta_2), 0], [0, 0, 1])`, { theta_0: joint_angles[0].toString(), theta_1: joint_angles[1].toString(), theta_2: joint_angles[2].toString() });
    const genJacobian =  nerdamer(`${solvedJacobian.text('decimals')}*${solvedDownToZero.text('decimals')}`);
    return matrix([
      [
        parseInt(nerdamer(`matget(${genJacobian}, 0, 0)`).evaluate().text('decimals')),
        parseInt(nerdamer(`matget(${genJacobian}, 1, 0)`).evaluate().text('decimals')),
        parseInt(nerdamer(`matget(${genJacobian}, 2, 0)`).evaluate().text('decimals')),
      ],
      [
        parseInt(nerdamer(`matget(${genJacobian}, 0, 1)`).evaluate().text('decimals')),
        parseInt(nerdamer(`matget(${genJacobian}, 1, 1)`).evaluate().text('decimals')),
        parseInt(nerdamer(`matget(${genJacobian}, 2, 1)`).evaluate().text('decimals')),
      ],
      [
        parseInt(nerdamer(`matget(${genJacobian}, 0, 2)`).evaluate().text('decimals')),
        parseInt(nerdamer(`matget(${genJacobian}, 1, 2)`).evaluate().text('decimals')),
        parseInt(nerdamer(`matget(${genJacobian}, 2, 2)`).evaluate().text('decimals')),
      ],
    ]);
  }

  getInverseGeneralJacobian(joint_angles: number[], L: number[]) {
    const jacobian = this.getGeneralJacobian(joint_angles, L);
    return inv(jacobian);
  }

  getTorquesV2(t: number[], td: number[], tdd: number[], L: number[], m: number[], w: number[], FN: number[], g: number) {
    // Ranges:
    // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
    // Paper: td1 - td3, Vars: td[1] - td[3]
    // Paper: tdd1 - tdd3, Vars: tdd[1] - tdd[3]
    // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)

    const shiftedT = [0, t[0], t[1], t[2]];
    const s = shiftedT.map(x => sin(x));
    const c = shiftedT.map(x => cos(x));
    const c12 = cos(shiftedT[1] + shiftedT[2]);
    const s12 = sin(shiftedT[1] + shiftedT[2]);
    const c23 = cos(shiftedT[2] + shiftedT[3]);
    const s23 = sin(shiftedT[2] + shiftedT[3]);
    const c123 = cos(shiftedT[1] + shiftedT[2] + shiftedT[3]);
    const s123 = sin(shiftedT[1] + shiftedT[2] + shiftedT[3]);
    const MM3_I = m[3]/12*((L[3]**2)+(w[3]**2));
    const MM2_I = m[2]/12*((L[2]**2)+(w[2]**2));
    
    const G_3 = 1/2*L[3]*m[3]*c123*g;
    const V_3 = FN[2]+L[3]*FN[1]+1/2*L[3]*m[3]*(L[1]*s23*(td[1]**2)+L[2]*s[3]*((td[1]+td[2])**2));
    const MM_31 = MM3_I+1/2*L[3]*m[3]*(L[1]*c23+L[2]*c[3]+1/2*L[3]);
    const MM_32 = MM3_I+1/2*L[3]*m[3]*(L[2]*c[3]+1/2*L[3]);
    const MM_33 = MM3_I+1/4*(L[3]**2)*m[3];

    const G_2 = L[2]*g*c12*(1/2*m[2]+m[3])+G_3;
    const V_2 = (
      1/2*L[2]*m[2]*L[1]*s[2]*(td[1]**2)+L[2]*(s[3]*FN[0]+c[3]*FN[1])+
      L[2]*m[3]*(s[3]*(-c23*L[1]*(td[1]**2)-c[3]*L[2]*((td[1]+td[2])**2)-1/2*L[3]*((td[1]+td[2]+td[3])**2))+c[3]*(s23*L[1]*(td[1]**2)+s[3]*L[2]*((td[1]+td[2])**2)))+V_3
    );
    const MM_21 = (
      MM2_I+1/2*L[2]*m[2]*(L[1]*c[2]+1/2*L[2])+
      L[2]*m[3]*(s[3]*(s23*L[1]+s[3]*L[2])+c[3]*(c23*L[1]+c[3]*L[2]+1/2*L[3]))+MM_31
    );
    const MM_22 = MM2_I+1/4*(L[2]**2)*m[2]*L[2]*m[3]*(L[2]+c[3]*1/2*L[3])+MM_32;
    const MM_23 = L[2]*m[3]*c[3]*1/2*L[3]+MM_33;

    const G_1 = L[1]*c[1]*g*(1/2*m[1]+m[2]+m[3])+G_2;
    const V_1 = (
      L[1]*(s23*FN[0]+c23*FN[1])+
      L[1]*m[3]*(s23*(-c23*L[1]*(td[1]**2)-L[2]*c[3]*((td[1]+td[2])**2)-1/2*L[3]*((td[1]+td[2]+td[3])**2))+c23*(s23*L[1]*(td[1]**2)+s[3]*L[2]*((td[1]+td[2])**2)))+
      L[1]*m[2]*(s[2]*(-c[2]*(td[1]**2)*L[1]-1/2*L[2]*((td[1]+td[2])**2))+c[2]*(s[2]*(td[1]**2)*L[1]))+V_2
    )
    const MM_11 = (
      m[1]/12*((L[1]**2)+(w[1]**2))+1/4*(L[1]**2)*m[1]+L[1]*m[3]*(s23*(s23*L[1]+s[3]*L[2])+c23*(c23*L[1]+c[3]*L[2]+1/2*L[3]))+
      L[1]*m[2]*(s[2]*(s[2]*L[1])+c[2]*(c[2]*L[1]+1/2*L[2]))+MM_21
    )
    const MM_12 = (
      L[1]*m[3]*(s23*(L[2]*s[3])+c23*(L[2]*c[3]+1/2*L[3]))+
      L[1]*m[2]*(c[2]*1/2*L[2])+MM_22
    )
    const MM_13 = (
      L[1]*m[3]*c12*1/2*L[3]+MM_23
    )

    const MM = matrix([
      [MM_11, MM_12, MM_13],
      [MM_21, MM_22, MM_23],
      [MM_31, MM_32, MM_33]
    ]);
    const V = vector([V_1, V_2, V_3]);
    const G = vector([G_1, G_2, G_3]);
    const TDD = vector([tdd[1], tdd[2], tdd[3]]);

    return add(add(multiply(MM, TDD), V), G);

  }

  getTorques(t: number[], tdZeroIsIgnored: number[], tddZeroIsIgnored: number[], L: number[], m: number[], w: number[], FN: number[], g: number) {
    // td[0] and tdd[0] MUST ALSO BE MADE USELESS SO THAT THE DATA IS IN 1 - 3

    // FN is [f_eex, f_eey, n_eez] forces and torques acting on end effector
    // g - gravity in "y" world direction

    // L[0] is essentially useless, so m[0] is also useless as well as w[0] (width of link)
    // Therefore, the indexes of L and m and w are correct!
    // s and c indexes are 0 - 2 on paper, so they are also correct!
    // td[0] and tdd[0] MUST ALSO BE MADE USELESS SO THAT THE DATA IS IN 1 - 3

    const td = tdZeroIsIgnored;
    const tdd = tddZeroIsIgnored;
    
    const s = t.map(x => sin(x));
    const c = t.map(x => cos(x));
    c[12] = cos(t[1] + t[2]);
    s[12] = sin(t[1] + t[2]);
    const c_01 = cos(t[0] + t[1]);
    const c_012 = cos(t[0] + t[1] + t[2]);

    const mm_11 = (
      1/12*(m[1]*(w[1]**2)+m[2]*(w[2]**2)+m[3]*(w[3]**2))+1/48*(L[1]**2)*m[1]+13/48*((L[2]**2)*m[2]+(L[3]**2)*m[3])+
      L[1]*L[2]*c[1]*(2*m[3]+m[2])+(L[1]**2)*m[3]+L[1]*L[3]*m[3]+(L[1]**2)*m[2]+(L[2]**2)*m[3]+L[2]*L[3]*c[2]*m[3]
    );
    const mm_12 = (
      1/12*(m[2]*(w[2]**2)+m[3]*(w[3]**2))+1/2*L[1]*L[3]*m[3]*c[12]+1/48*(L[2]**2)*m[2]+
      13/48*(L[3]**2)*m[3]+L[1]*L[2]*c[1]*m[3]+(L[2]**2)*m[3]+L[2]*L[3]*c[2]*m[3]
    );
    const mm_13 = (
      1/12*m[3]*(w[3]**2)+1/48*(L[3]**2)*m[3]
    );
    const V_1 = (
      -L[1]*L[3]*m[3]*s[12]*(1/2*(td[2]**2)+1/2*(td[3]**2)+(td[1]*td[2])+(td[1]*td[3]))-L[2]*L[3]*m[3]*s[2]*(td[1]*td[3]+td[2]*td[3]+1/2*(td[3]**2))
      -L[1]*L[2]*m[2]*s[1]*((td[2]**2)+td[1]*td[2])-L[1]*L[2]*m[3]*s[1]*(2*td[1]*td[2]+(td[2]**2))-L[1]*L[2]*m[3]*s[12]*td[2]*td[3]+
      FN[0]*(L[1]*s[12]+L[2]*s[2])+FN[1]*(L[3]+L[2]*c[2]+L[1]*c[12])+FN[2]
    );
    const G_1 = L[1]*c[0]*g*(1/2*m[1]+m[2]+m[3])+L[2]*c_01*g*(1/2*m[2]+m[3])+1/2*L[3]*c_012*g*m[3];

    const mm_21 = (
      1/2*c[12]*L[1]*L[3]*m[3]+1/12*(m[2]*(w[2]**2)+m[3]*(w[3]**2))+13/48*((L[2]**2)*m[2]+(L[3]**2)*m[3])+L[1]*L[2]*c[1]*m[3]+
      L[2]*L[3]*c[2]*m[3]+(L[2]**2)*m[3]+1/2*L[1]*L[2]*m[2]*c[1]
    )
    const mm_22 = (
      1/12*(m[2]*(w[2]**2)+m[3]*(w[3]**2))+1/48*(L[2]**2)*m[2]+13/48*(L[3]**2)*m[3]+L[2]*L[3]*c[2]*m[3]+(L[2]**2)*m[3]
    )
    const mm_23 = (
      1/12*m[3]*(w[3]**2)+1/48*(L[3]**2)*m[3]
    )
    const V_2 = (
      -L[2]*L[3]*m[3]*s[2]*(1/2*(td[3]**2)+td[1]*td[3]+td[2]*td[3])+L[1]*L[2]*m[3]*s[1]*(td[1]**2)+
      1/2*L[1]*L[3]*s[12]*m[3]*(td[1]**2)+FN[1]*(L[2]*c[2]+L[3])+FN[0]*(L[2]*s[2])+FN[2]
    )
    const G_2 = (
      L[2]*c_01*g*(1/2*m[2]+m[3])+L[3]*c_012*g*(1/2*m[3])
    )

    const mm_31 = (
      1/12*m[3]*(w[3]**2)+1/2*L[1]*L[3]*m[3]*c[12]+13/48*(L[3]**2)*m[3]+1/2*L[2]*L[3]*c[2]*m[3]
    )
    const mm_32 = (
      1/12*m[3]*(w[3]**2)+13/48*(L[3]**2)*m[3]+1/2*L[2]*L[3]*c[2]*m[3]
    )
    const mm_33 = (
      1/12*m[3]*(w[3]**2)+1/48*(L[3]**2)*m[3]
    )
    const V_3 = (
      FN[1]*L[3]+FN[2]+1/2*L[1]*L[3]*m[3]*s[12]*(td[1]**2)+L[2]*L[3]*m[3]*s[2]*(1/2*((td[1]**2)+(td[2]**2)+td[1]*td[2]))
    )
    const G_3 = (
      1/2*L[3]*m[3]*g*c_012
    )

    const MM = matrix([
      [mm_11, mm_12, mm_13],
      [mm_21, mm_22, mm_23],
      [mm_31, mm_32, mm_33]
    ]);
    const V = vector([V_1, V_2, V_3]);
    const G = vector([G_1, G_2, G_3]);
    const TDD = vector([tdd[1], tdd[2], tdd[3]]);

    return add(add(multiply(MM, TDD), V), G);
  }

  getAccelerationsV2(t: number[], td: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number) {
    // Ranges:
    // Paper: t1 - t3, Vars: t[0] - t[2] (mitigated using shift)
    // Paper: td1 - td3, Vars: td[1] - td[3]
    // Paper: tdd1 - tdd3, Vars: tdd[1] - tdd[3]
    // Paper: L1 - L3, Vars: L[1] - L[3] (and m, w)

    const shiftedT = [0, t[0], t[1], t[2]];
    const s = shiftedT.map(x => sin(x));
    const c = shiftedT.map(x => cos(x));
    const c12 = cos(shiftedT[1] + shiftedT[2]);
    const s12 = sin(shiftedT[1] + shiftedT[2]);
    const c23 = cos(shiftedT[2] + shiftedT[3]);
    const s23 = sin(shiftedT[2] + shiftedT[3]);
    const c123 = cos(shiftedT[1] + shiftedT[2] + shiftedT[3]);
    const s123 = sin(shiftedT[1] + shiftedT[2] + shiftedT[3]);
    const MM3_I = m[3]/12*((L[3]**2)+(w[3]**2));
    const MM2_I = m[2]/12*((L[2]**2)+(w[2]**2));
    
    const G_3 = 1/2*L[3]*m[3]*c123*g;
    const V_3 = FN[2]+L[3]*FN[1]+1/2*L[3]*m[3]*(L[1]*s23*(td[1]**2)+L[2]*s[3]*((td[1]+td[2])**2));
    const MM_31 = MM3_I+1/2*L[3]*m[3]*(L[1]*c23+L[2]*c[3]+1/2*L[3]);
    const MM_32 = MM3_I+1/2*L[3]*m[3]*(L[2]*c[3]+1/2*L[3]);
    const MM_33 = MM3_I+1/4*(L[3]**2)*m[3];

    const G_2 = L[2]*g*c12*(1/2*m[2]+m[3])+G_3;
    const V_2 = (
      1/2*L[2]*m[2]*L[1]*s[2]*(td[1]**2)+L[2]*(s[3]*FN[0]+c[3]*FN[1])+
      L[2]*m[3]*(s[3]*(-c23*L[1]*(td[1]**2)-c[3]*L[2]*((td[1]+td[2])**2)-1/2*L[3]*((td[1]+td[2]+td[3])**2))+c[3]*(s23*L[1]*(td[1]**2)+s[3]*L[2]*((td[1]+td[2])**2)))+V_3
    );
    const MM_21 = (
      MM2_I+1/2*L[2]*m[2]*(L[1]*c[2]+1/2*L[2])+
      L[2]*m[3]*(s[3]*(s23*L[1]+s[3]*L[2])+c[3]*(c23*L[1]+c[3]*L[2]+1/2*L[3]))+MM_31
    );
    const MM_22 = MM2_I+1/4*(L[2]**2)*m[2]*L[2]*m[3]*(L[2]+c[3]*1/2*L[3])+MM_32;
    const MM_23 = L[2]*m[3]*c[3]*1/2*L[3]+MM_33;

    const G_1 = L[1]*c[1]*g*(1/2*m[1]+m[2]+m[3])+G_2;
    const V_1 = (
      L[1]*(s23*FN[0]+c23*FN[1])+
      L[1]*m[3]*(s23*(-c23*L[1]*(td[1]**2)-L[2]*c[3]*((td[1]+td[2])**2)-1/2*L[3]*((td[1]+td[2]+td[3])**2))+c23*(s23*L[1]*(td[1]**2)+s[3]*L[2]*((td[1]+td[2])**2)))+
      L[1]*m[2]*(s[2]*(-c[2]*(td[1]**2)*L[1]-1/2*L[2]*((td[1]+td[2])**2))+c[2]*(s[2]*(td[1]**2)*L[1]))+V_2
    )
    const MM_11 = (
      m[1]/12*((L[1]**2)+(w[1]**2))+1/4*(L[1]**2)*m[1]+L[1]*m[3]*(s23*(s23*L[1]+s[3]*L[2])+c23*(c23*L[1]+c[3]*L[2]+1/2*L[3]))+
      L[1]*m[2]*(s[2]*(s[2]*L[1])+c[2]*(c[2]*L[1]+1/2*L[2]))+MM_21
    )
    const MM_12 = (
      L[1]*m[3]*(s23*(L[2]*s[3])+c23*(L[2]*c[3]+1/2*L[3]))+
      L[1]*m[2]*(c[2]*1/2*L[2])+MM_22
    )
    const MM_13 = (
      L[1]*m[3]*c12*1/2*L[3]+MM_23
    )

    const MM = matrix([
      [MM_11, MM_12, MM_13],
      [MM_21, MM_22, MM_23],
      [MM_31, MM_32, MM_33]
    ]);
    const V = vector([-V_1, -V_2, -V_3]);
    const G = vector([-G_1, -G_2, -G_3]);
    const F = vector([-0.3 * td[1] - 0.3 * sign(td[1]), -0.3 * td[2] - 0.3 * sign(td[2]), -0.3 * td[3] - 0.3 * sign(td[3])]);
    const TQS = vector(torques);

    return multiply(inv(MM), (add(add(add(TQS, V), G), F)))
  }

  getAccelerations(t: number[], tdZeroIsIgnored: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number) {
    const td = tdZeroIsIgnored;
    
    const s = t.map(x => sin(x));
    const c = t.map(x => cos(x));
    c[12] = cos(t[1] + t[2]);
    s[12] = sin(t[1] + t[2]);
    const c_01 = cos(t[0] + t[1]);
    const c_012 = cos(t[0] + t[1] + t[2]);

    const mm_11 = (
      1/12*(m[1]*(w[1]**2)+m[2]*(w[2]**2)+m[3]*(w[3]**2))+1/48*(L[1]**2)*m[1]+13/48*((L[2]**2)*m[2]+(L[3]**2)*m[3])+
      L[1]*L[2]*c[1]*(2*m[3]+m[2])+(L[1]**2)*m[3]+L[1]*L[3]*m[3]+(L[1]**2)*m[2]+(L[2]**2)*m[3]+L[2]*L[3]*c[2]*m[3]
    );
    const mm_12 = (
      1/12*(m[2]*(w[2]**2)+m[3]*(w[3]**2))+1/2*L[1]*L[3]*m[3]*c[12]+1/48*(L[2]**2)*m[2]+
      13/48*(L[3]**2)*m[3]+L[1]*L[2]*c[1]*m[3]+(L[2]**2)*m[3]+L[2]*L[3]*c[2]*m[3]
    );
    const mm_13 = (
      1/12*m[3]*(w[3]**2)+1/48*(L[3]**2)*m[3]
    );
    const V_1 = (
      -L[1]*L[3]*m[3]*s[12]*(1/2*(td[2]**2)+1/2*(td[3]**2)+(td[1]*td[2])+(td[1]*td[3]))-L[2]*L[3]*m[3]*s[2]*(td[1]*td[3]+td[2]*td[3]+1/2*(td[3]**2))
      -L[1]*L[2]*m[2]*s[1]*((td[2]**2)+td[1]*td[2])-L[1]*L[2]*m[3]*s[1]*(2*td[1]*td[2]+(td[2]**2))-L[1]*L[2]*m[3]*s[12]*td[2]*td[3]+
      FN[0]*(L[1]*s[12]+L[2]*s[2])+FN[1]*(L[3]+L[2]*c[2]+L[1]*c[12])+FN[2]
    );
    const G_1 = L[1]*c[0]*g*(1/2*m[1]+m[2]+m[3])+L[2]*c_01*g*(1/2*m[2]+m[3])+1/2*L[3]*c_012*g*m[3];

    const mm_21 = (
      1/2*c[12]*L[1]*L[3]*m[3]+1/12*(m[2]*(w[2]**2)+m[3]*(w[3]**2))+13/48*((L[2]**2)*m[2]+(L[3]**2)*m[3])+L[1]*L[2]*c[1]*m[3]+
      L[2]*L[3]*c[2]*m[3]+(L[2]**2)*m[3]+1/2*L[1]*L[2]*m[2]*c[1]
    )
    const mm_22 = (
      1/12*(m[2]*(w[2]**2)+m[3]*(w[3]**2))+1/48*(L[2]**2)*m[2]+13/48*(L[3]**2)*m[3]+L[2]*L[3]*c[2]*m[3]+(L[2]**2)*m[3]
    )
    const mm_23 = (
      1/12*m[3]*(w[3]**2)+1/48*(L[3]**2)*m[3]
    )
    const V_2 = (
      -L[2]*L[3]*m[3]*s[2]*(1/2*(td[3]**2)+td[1]*td[3]+td[2]*td[3])+L[1]*L[2]*m[3]*s[1]*(td[1]**2)+
      1/2*L[1]*L[3]*s[12]*m[3]*(td[1]**2)+FN[1]*(L[2]*c[2]+L[3])+FN[0]*(L[2]*s[2])+FN[2]
    )
    const G_2 = (
      L[2]*c_01*g*(1/2*m[2]+m[3])+L[3]*c_012*g*(1/2*m[3])
    )

    const mm_31 = (
      1/12*m[3]*(w[3]**2)+1/2*L[1]*L[3]*m[3]*c[12]+13/48*(L[3]**2)*m[3]+1/2*L[2]*L[3]*c[2]*m[3]
    )
    const mm_32 = (
      1/12*m[3]*(w[3]**2)+13/48*(L[3]**2)*m[3]+1/2*L[2]*L[3]*c[2]*m[3]
    )
    const mm_33 = (
      1/12*m[3]*(w[3]**2)+1/48*(L[3]**2)*m[3]
    )
    const V_3 = (
      FN[1]*L[3]+FN[2]+1/2*L[1]*L[3]*m[3]*s[12]*(td[1]**2)+L[2]*L[3]*m[3]*s[2]*(1/2*((td[1]**2)+(td[2]**2)+td[1]*td[2]))
    )
    const G_3 = (
      1/2*L[3]*m[3]*g*c_012
    )

    const MM = matrix([
      [mm_11, mm_12, mm_13],
      [mm_21, mm_22, mm_23],
      [mm_31, mm_32, mm_33]
    ]);
    const V = vector([V_1, V_2, V_3]);
    // const V = vector([0, 0, 0]);
    const G = vector([G_1, G_2, G_3]);
    const F = vector([-3000 * td[1] - 3000 * sign(td[1]), -3000 * td[2] - 3000 * sign(td[2]), -3000 * td[3] - 3000 * sign(td[3])]);
    // console.log(V);

    return multiply(inv(MM), (add(add(add(vector(torques), multiply(V, -1)), multiply(G, -1)), F)));

  }

  getGeneralAccelerations(t: number[], tdZeroIsIgnored: number[], torques: number[], L: number[], m: number[], w: number[], FN: number[], g: number) {
    const n: string[] = [];
    n[0] = `(-1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_3^2+(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_2+(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_3+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_1*theta_dot_dot_1*w_1^2+(1/12)*m_2*theta_dot_dot_1*w_2^2+(1/12)*m_2*theta_dot_dot_2*w_2^2+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2*theta_dot_dot_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_3+(1/2)*L1*cos(theta_0)*g*m_1+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_3+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(13/48)*L1^2*m_1*theta_dot_dot_1+(13/48)*L2^2*m_2*theta_dot_dot_1+(13/48)*L2^2*m_2*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_3-2*L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-2*L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1*theta_dot_2-L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_2^2-L1*L2*m_2*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_2^2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2*theta_dot_3-L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1-L1*eefY*sin(theta_1)*sin(theta_2)-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+2*L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_1+2*L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_1+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_2+L1*L2*cos(theta_1)*m_2*theta_dot_dot_1+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_2+L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+L1*cos(theta_0)*cos(theta_1)^2*cos(theta_2)^2*g*m_3+L1*cos(theta_0)*cos(theta_1)^2*g*m_2+L1*cos(theta_0)*cos(theta_1)^2*g*m_3*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_2)^2*g*m_3*sin(theta_1)^2+L1*cos(theta_0)*g*m_2*sin(theta_1)^2+L1*cos(theta_0)*g*m_3*sin(theta_1)^2*sin(theta_2)^2+L1*cos(theta_1)*cos(theta_2)*eefY+L1*cos(theta_1)*eefX*sin(theta_2)+L1*cos(theta_2)*eefX*sin(theta_1)+L1^2*cos(theta_1)^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L1^2*cos(theta_1)^2*m_2*theta_dot_dot_1+L1^2*cos(theta_1)^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L1^2*cos(theta_2)^2*m_3*sin(theta_1)^2*theta_dot_dot_1+L1^2*m_2*sin(theta_1)^2*theta_dot_dot_1+L1^2*m_3*sin(theta_1)^2*sin(theta_2)^2*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2+L2*cos(theta_2)*eefY+L2*eefX*sin(theta_2)+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_2+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_2+L3*eefY+eenZ`;
    n[1] = `(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_2*theta_dot_dot_1*w_2^2+(1/12)*m_2*theta_dot_dot_2*w_2^2+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2*theta_dot_dot_1+(1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_3+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(13/48)*L2^2*m_2*theta_dot_dot_1+(13/48)*L2^2*m_2*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_1+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_1+L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1^2+L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1^2+L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2+L2*cos(theta_2)*eefY+L2*eefX*sin(theta_2)+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_2+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_2+L3*eefY+eenZ`;
    n[2] = `(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_2^2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_3+L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_2+L3*eefY+eenZ`;
    const G: string[] = [];
    const V: string[] = [];
    const MM: string[][] = [[], [], []];

    for (var i = 0; i < 3; i++) {
      const nMod = n[i].split('+').join('§+').split('-').join('§-').split('§+(§-1/2)').join('§-(1/2)').split('(§-1/2)').join('-(1/2)');
      const parts = nMod.split('§');
      G[i] = '';
      V[i] = '';
      MM[i][0] = '';
      MM[i][1] = '';
      MM[i][2] = '';
      for (var j = 0; j < parts.length; j++) {
        if (parts[j].includes('g')) {
          G[i] += `+(${parts[j]})`;
        }
        else if (parts[j].includes('theta_dot_dot_1')) {
          MM[i][0] += `+(${parts[j]})`.split('*theta_dot_dot_1').join('');
        }
        else if (parts[j].includes('theta_dot_dot_2')) {
          MM[i][1] += `+(${parts[j]})`.split('*theta_dot_dot_2').join('');
        }
        else if (parts[j].includes('theta_dot_dot_3')) {
          MM[i][2] += `+(${parts[j]})`.split('*theta_dot_dot_3').join('');
        }
        else if (parts[j].includes('theta_dot_')) {
          V[i] += `+(${parts[j]})`;
        }
        // if (parts[i].includes('theta_dot_dot_'))
      }
    }

    // const V_vector = nerdamer(`matrix([${V[0]}], [${V[1]}], [${V[2]}])`);
    // console.log("V_vector");
    // console.log(V_vector.text());
    const V_vector = `matrix([(-1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_3^2+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2-2*L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-2*L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1*theta_dot_2-L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_2^2-L1*L2*m_2*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_2^2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3],[(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3+L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1^2+L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1^2],[(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_2^2+L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_2])`;
    // OLD & WRONG: const V_vector = `matrix([(-1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_3^2+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2-2*L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-2*L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1*theta_dot_2-L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_2^2-L1*L2*m_2*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_2^2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3],[(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3+L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1^2+L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1^2],[(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_2^2+L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_2])`;
    // const G_vector = nerdamer(`matrix([${G[0]}], [${G[1]}], [${G[2]}])`);
    // console.log("G_vector");
    // console.log(G_vector.text());
    const G_vector = `matrix([(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/2)*L1*cos(theta_0)*g*m_1+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_1)^2*cos(theta_2)^2*g*m_3+L1*cos(theta_0)*cos(theta_1)^2*g*m_2+L1*cos(theta_0)*cos(theta_1)^2*g*m_3*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_2)^2*g*m_3*sin(theta_1)^2+L1*cos(theta_0)*g*m_2*sin(theta_1)^2+L1*cos(theta_0)*g*m_3*sin(theta_1)^2*sin(theta_2)^2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2],[(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2],[(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3])`;
    // OLD & WRONG: const G_vector = `matrix([(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/2)*L1*cos(theta_0)*g*m_1+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_1)^2*cos(theta_2)^2*g*m_3+L1*cos(theta_0)*cos(theta_1)^2*g*m_2+L1*cos(theta_0)*cos(theta_1)^2*g*m_3*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_2)^2*g*m_3*sin(theta_1)^2+L1*cos(theta_0)*g*m_2*sin(theta_1)^2+L1*cos(theta_0)*g*m_3*sin(theta_1)^2*sin(theta_2)^2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2],[(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2],[(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3])`;
    const F_vector = nerdamer(`matrix([0.3*theta_dot_1+0.3*sign(theta_dot_1)], [0.3*theta_dot_2+0.3*sign(theta_dot_2)], [0.3*theta_dot_3+0.3*sign(theta_dot_3)])`);
    const Torques_vector = nerdamer(`matrix([${torques[0]}], [${torques[1]}], [${torques[2]}])`);
    // console.log("MM");
    // console.log(nerdamer(`matrix([${MM[0][0]}, ${MM[0][1]}, ${MM[0][2]}], [${MM[1][0]}, ${MM[1][1]}, ${MM[1][2]}], [${MM[2][0]}, ${MM[2][1]}, ${MM[2][2]}])`).text());
    // const MM_matrix = nerdamer(`matrix([${MM[0][0]}, ${MM[0][1]}, ${MM[0][2]}], [${MM[1][0]}, ${MM[1][1]}, ${MM[1][2]}], [${MM[2][0]}, ${MM[2][1]}, ${MM[2][2]}])`)
    // console.log("MM_Matrix");
    // console.log(MM_matrix.text());
    const MM_matrix = `matrix([(1/12)*m_1*w_1^2+(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(13/48)*L1^2*m_1+(13/48)*L2^2*m_2+(13/48)*L3^2*m_3-L1*L3*m_3*sin(theta_1)*sin(theta_2)+2*L1*L2*cos(theta_1)*cos(theta_2)^2*m_3+2*L1*L2*cos(theta_1)*m_3*sin(theta_2)^2+L1*L2*cos(theta_1)*m_2+L1*L3*cos(theta_1)*cos(theta_2)*m_3+L1^2*cos(theta_1)^2*cos(theta_2)^2*m_3+L1^2*cos(theta_1)^2*m_2+L1^2*cos(theta_1)^2*m_3*sin(theta_2)^2+L1^2*cos(theta_2)^2*m_3*sin(theta_1)^2+L1^2*m_2*sin(theta_1)^2+L1^2*m_3*sin(theta_1)^2*sin(theta_2)^2+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(13/48)*L2^2*m_2+(13/48)*L3^2*m_3+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(1/2)*L2*L3*cos(theta_2)*m_3+(13/48)*L3^2*m_3],[(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(13/48)*L2^2*m_2+(13/48)*L3^2*m_3+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(13/48)*L2^2*m_2+(13/48)*L3^2*m_3+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(1/12)*m_3*w_3^2+(1/2)*L2*L3*cos(theta_2)*m_3+(13/48)*L3^2*m_3],[(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(1/2)*L2*L3*cos(theta_2)*m_3+(13/48)*L3^2*m_3,(1/12)*m_3*w_3^2+(1/2)*L2*L3*cos(theta_2)*m_3+(13/48)*L3^2*m_3,(1/12)*m_3*w_3^2+(13/48)*L3^2*m_3])`;
    // OLD & WRONG: const MM_matrix = nerdamer(`matrix([(1/12)*m_1*w_1^2+(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(1/48)*L1^2*m_1+(13/48)*L2^2*m_2+(13/48)*L3^2*m_3-L1*L3*m_3*sin(theta_1)*sin(theta_2)+2*L1*L2*cos(theta_1)*cos(theta_2)^2*m_3+2*L1*L2*cos(theta_1)*m_3*sin(theta_2)^2+L1*L2*cos(theta_1)*m_2+L1*L3*cos(theta_1)*cos(theta_2)*m_3+L1^2*cos(theta_1)^2*cos(theta_2)^2*m_3+L1^2*cos(theta_1)^2*m_2+L1^2*cos(theta_1)^2*m_3*sin(theta_2)^2+L1^2*cos(theta_2)^2*m_3*sin(theta_1)^2+L1^2*m_2*sin(theta_1)^2+L1^2*m_3*sin(theta_1)^2*sin(theta_2)^2+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(1/48)*L2^2*m_2+(13/48)*L3^2*m_3+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(1/12)*m_3*w_3^2+(1/48)*L3^2*m_3],[(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(13/48)*L2^2*m_2+(13/48)*L3^2*m_3+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(1/12)*m_2*w_2^2+(1/12)*m_3*w_3^2+(1/48)*L2^2*m_2+(13/48)*L3^2*m_3+L2*L3*cos(theta_2)*m_3+L2^2*cos(theta_2)^2*m_3+L2^2*m_3*sin(theta_2)^2,(1/12)*m_3*w_3^2+(1/48)*L3^2*m_3],[(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)+(1/12)*m_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3+(1/2)*L2*L3*cos(theta_2)*m_3+(13/48)*L3^2*m_3,(1/12)*m_3*w_3^2+(1/2)*L2*L3*cos(theta_2)*m_3+(13/48)*L3^2*m_3,(1/12)*m_3*w_3^2+(1/48)*L3^2*m_3])`);
    const mms = nerdamer(MM_matrix, {
      theta_0: t[0].toString(), theta_1: t[1].toString(), theta_2: t[2].toString(),
      theta_dot_1: tdZeroIsIgnored[1].toString(), theta_dot_2: tdZeroIsIgnored[2].toString(), theta_dot_3: tdZeroIsIgnored[3].toString(),
      L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString(), m_1: m[1].toString(), m_2: m[2].toString(), m_3: m[3].toString(),
      w_1: w[1].toString(), w_2: w[2].toString(), w_3: w[3].toString(), g: g.toString(),
      eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
    }).evaluate();
    const MM_matrix_rearranged = nerdamer(`matrix([matget(${mms}, 0, 0), matget(${mms}, 1, 0), matget(${mms}, 2, 0)], [matget(${mms}, 3, 0), matget(${mms}, 4, 0), matget(${mms}, 5, 0)], [matget(${mms}, 6, 0), matget(${mms}, 7, 0), matget(${mms}, 8, 0)])`);

    const res = nerdamer(`invert(${MM_matrix_rearranged})*(${Torques_vector}-${V_vector}-${G_vector}-${F_vector})`, { 
      theta_0: t[0].toString(), theta_1: t[1].toString(), theta_2: t[2].toString(),
      theta_dot_1: tdZeroIsIgnored[1].toString(), theta_dot_2: tdZeroIsIgnored[2].toString(), theta_dot_3: tdZeroIsIgnored[3].toString(),
      L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString(), m_1: m[1].toString(), m_2: m[2].toString(), m_3: m[3].toString(),
      w_1: w[1].toString(), w_2: w[2].toString(), w_3: w[3].toString(), g: g.toString(),
      eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
    }).evaluate();

    return vector([
      parseFloat(nerdamer(`matget(${res}, 0, 0)`).text('decimals')),
      parseFloat(nerdamer(`matget(${res}, 1, 0)`).text('decimals')),
      parseFloat(nerdamer(`matget(${res}, 2, 0)`).text('decimals')),
    ]);

  }

  getGeneralTorques(t: number[], tdZeroIsIgnored: number[], tddZeroIsIgnored: number[], L: number[], m: number[], w: number[], FN: number[], g: number) {
    
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
    // nerdamer.setVar('omega_dot_0', 'matrix([0], [0], [0])')
    // nerdamer.setVar('v_dot_0', 'matrix([0], [g], [0])');
    // nerdamer.setConstant('L0', 0);

    // for (var i = 1; i <= 4; i++) {
    //   if (i == 4) {
    //     nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[0]))`);
    //     const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
    //     nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);

    //     nerdamer.setVar(`omega_dot_${i}`, `(R${i}${i-1}*omega_dot_${i-1})+(matrix([0], [0], [0]))`);
    //     const vectorizedOmegaDot = nerdamer(`[matget(omega_dot_${i-1}, 0, 0), matget(omega_dot_${i-1}, 1, 0), matget(omega_dot_${i-1}, 2, 0)]`).text();
    //     nerdamer.setVar(`v_dot_${i}`, `(R${i}${i-1})*((cross(${vectorizedOmegaDot}, [L${i-1}, 0, 0]))+(cross(${vectorizedOmega}, cross(${vectorizedOmega}, [L${i-1}, 0, 0])))+(v_dot_${i-1}))`);

    //   }
    //   else {
    //     nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[theta_dot_${i}]))`);
    //     const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
    //     nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, [L${i-1}, 0, 0])))`);

    //     nerdamer.setVar(`omega_dot_${i}`, `(R${i}${i-1}*omega_dot_${i-1})+(matrix([0], [0], [theta_dot_dot_${i}]))`);
    //     const vectorizedOmegaDot = nerdamer(`[matget(omega_dot_${i-1}, 0, 0), matget(omega_dot_${i-1}, 1, 0), matget(omega_dot_${i-1}, 2, 0)]`).text();
    //     nerdamer.setVar(`v_dot_${i}`, `(R${i}${i-1})*((cross(${vectorizedOmegaDot}, [L${i-1}, 0, 0]))+(cross(${vectorizedOmega}, cross(${vectorizedOmega}, [L${i-1}, 0, 0])))+(v_dot_${i-1}))`);

    //     nerdamer.setVar(`I_${i}`, `matrix([(m_${i}/12)*(((w_${i})^2)+((h_${i})^2)), 0, 0], [0, (m_${i}/12)*(((L${i}/2)^2)+((h_${i})^2)), 0], [0, 0, (m_${i}/12)*(((L${i}/2)^2)+((w_${i})^2))])`);
    //     const vectorizedOmegaI = nerdamer(`[matget(omega_${i}, 0, 0), matget(omega_${i}, 1, 0), matget(omega_${i}, 2, 0)]`).text();
    //     const vectorizedOmegaIDot = nerdamer(`[matget(omega_dot_${i}, 0, 0), matget(omega_dot_${i}, 1, 0), matget(omega_dot_${i}, 2, 0)]`).text();
    //     nerdamer.setVar(`vc_dot_${i}`, `(cross(${vectorizedOmegaIDot}, [L${i}/2, 0, 0]))+(cross(${vectorizedOmegaI}, cross(${vectorizedOmegaI}, [L${i}/2, 0, 0])))+v_dot_${i}`);
    //     // YOU DUMB MORON - examine what this changes, there was ^^ an error right here where I had "vectorizedOmegaDot" instead of "vectorizedOmegaIDot"

    //     nerdamer.setVar(`F_${i}`, `m_${i}*vc_dot_${i}`);
    //     const vectorizedITimesOmega = nerdamer(`[matget((I_${i}*omega_${i}), 0, 0), matget((I_${i}*omega_${i}), 1, 0), matget((I_${i}*omega_${i}), 2, 0)]`);
    //     nerdamer.setVar(`N_${i}`, `(I_${i}*omega_dot_${i})+(cross(${vectorizedOmegaI}, ${vectorizedITimesOmega}))`);

    //   }
    // }

    // for (var i = 3; i >= 1; i--) {

    //   if (i === 3) {
    //     nerdamer.setVar(`f_${i}`, `(R${i}${i+1}*(matrix([eefX], [eefY], [0])))+(F_${i})`);
    //     const vectorizedFI = nerdamer(`[matget(F_${i}, 0, 0), matget(F_${i}, 1, 0), matget(F_${i}, 2, 0)]`).text();
    //     const vectorizedRf = nerdamer(`[matget((R${i}${i+1})*matrix([eefX], [eefY], [0]), 0, 0), matget((R${i}${i+1})*matrix([eefX], [eefY], [0]), 1, 0), matget((R${i}${i+1})*matrix([eefX], [eefY], [0]), 2, 0)]`).text();
    //     nerdamer.setVar(`n_${i}`, `(N_${i})+((R${i}${i+1})*(matrix([0], [0], [eenZ])))+(cross([L${i}/2, 0, 0], ${vectorizedFI}))+(cross([L${i}, 0, 0], ${vectorizedRf}))`)
    //   }
    //   else {
    //     nerdamer.setVar(`f_${i}`, `(R${i}${i+1}*f_${i+1})+(F_${i})`);
    //     const vectorizedFI = nerdamer(`[matget(F_${i}, 0, 0), matget(F_${i}, 1, 0), matget(F_${i}, 2, 0)]`).text();
    //     const vectorizedRf = nerdamer(`[matget((R${i}${i+1})*f_${i+1}, 0, 0), matget((R${i}${i+1})*f_${i+1}, 1, 0), matget((R${i}${i+1})*f_${i+1}, 2, 0)]`).text();
    //     nerdamer.setVar(`n_${i}`, `(N_${i})+((R${i}${i+1})*(n_${i+1}))+(cross([L${i}/2, 0, 0], ${vectorizedFI}))+(cross([L${i}, 0, 0], ${vectorizedRf}))`)
    //   }

    // }

    const n: string[] = [];
    // OLD & WRONG: n[0] = `(-1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_3^2+(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_2+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_1*theta_dot_dot_1*w_1^2+(1/12)*m_2*theta_dot_dot_1*w_2^2+(1/12)*m_2*theta_dot_dot_2*w_2^2+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_2+(1/2)*L1*cos(theta_0)*g*m_1+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(1/48)*L1^2*m_1*theta_dot_dot_1+(1/48)*L2^2*m_2*theta_dot_dot_2+(1/48)*L3^2*m_3*theta_dot_dot_3+(13/48)*L2^2*m_2*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2-2*L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-2*L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1*theta_dot_2-L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_2^2-L1*L2*m_2*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_2^2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2*theta_dot_3-L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1-L1*eefY*sin(theta_1)*sin(theta_2)-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+2*L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_1+2*L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_1+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_2+L1*L2*cos(theta_1)*m_2*theta_dot_dot_1+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_2+L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+L1*cos(theta_0)*cos(theta_1)^2*cos(theta_2)^2*g*m_3+L1*cos(theta_0)*cos(theta_1)^2*g*m_2+L1*cos(theta_0)*cos(theta_1)^2*g*m_3*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_2)^2*g*m_3*sin(theta_1)^2+L1*cos(theta_0)*g*m_2*sin(theta_1)^2+L1*cos(theta_0)*g*m_3*sin(theta_1)^2*sin(theta_2)^2+L1*cos(theta_1)*cos(theta_2)*eefY+L1*cos(theta_1)*eefX*sin(theta_2)+L1*cos(theta_2)*eefX*sin(theta_1)+L1^2*cos(theta_1)^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L1^2*cos(theta_1)^2*m_2*theta_dot_dot_1+L1^2*cos(theta_1)^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L1^2*cos(theta_2)^2*m_3*sin(theta_1)^2*theta_dot_dot_1+L1^2*m_2*sin(theta_1)^2*theta_dot_dot_1+L1^2*m_3*sin(theta_1)^2*sin(theta_2)^2*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2+L2*cos(theta_2)*eefY+L2*eefX*sin(theta_2)+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_2+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_2+L3*eefY+eenZ`;
    n[0] = `(-1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2^2+(-1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_3^2+(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_2+(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_3+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_1*theta_dot_dot_1*w_1^2+(1/12)*m_2*theta_dot_dot_1*w_2^2+(1/12)*m_2*theta_dot_dot_2*w_2^2+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2*theta_dot_dot_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_3+(1/2)*L1*cos(theta_0)*g*m_1+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_3+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(13/48)*L1^2*m_1*theta_dot_dot_1+(13/48)*L2^2*m_2*theta_dot_dot_1+(13/48)*L2^2*m_2*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_3-2*L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-2*L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1*theta_dot_2-L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_2^2-L1*L2*m_2*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_2^2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_2-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1*theta_dot_3-L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_2*theta_dot_3-L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1-L1*eefY*sin(theta_1)*sin(theta_2)-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+2*L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_1+2*L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_1+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_2+L1*L2*cos(theta_1)*m_2*theta_dot_dot_1+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_2+L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+L1*cos(theta_0)*cos(theta_1)^2*cos(theta_2)^2*g*m_3+L1*cos(theta_0)*cos(theta_1)^2*g*m_2+L1*cos(theta_0)*cos(theta_1)^2*g*m_3*sin(theta_2)^2+L1*cos(theta_0)*cos(theta_2)^2*g*m_3*sin(theta_1)^2+L1*cos(theta_0)*g*m_2*sin(theta_1)^2+L1*cos(theta_0)*g*m_3*sin(theta_1)^2*sin(theta_2)^2+L1*cos(theta_1)*cos(theta_2)*eefY+L1*cos(theta_1)*eefX*sin(theta_2)+L1*cos(theta_2)*eefX*sin(theta_1)+L1^2*cos(theta_1)^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L1^2*cos(theta_1)^2*m_2*theta_dot_dot_1+L1^2*cos(theta_1)^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L1^2*cos(theta_2)^2*m_3*sin(theta_1)^2*theta_dot_dot_1+L1^2*m_2*sin(theta_1)^2*theta_dot_dot_1+L1^2*m_3*sin(theta_1)^2*sin(theta_2)^2*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2+L2*cos(theta_2)*eefY+L2*eefX*sin(theta_2)+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_2+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_2+L3*eefY+eenZ`;
    // const n1 = nerdamer('matget(n_1, 2, 0)');
    // console.log(n1.expand().text('fractions'));
    // OLD & WRONG: n[1] = `(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_2*theta_dot_dot_1*w_2^2+(1/12)*m_2*theta_dot_dot_2*w_2^2+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2*theta_dot_dot_1+(1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(1/48)*L2^2*m_2*theta_dot_dot_2+(1/48)*L3^2*m_3*theta_dot_dot_3+(13/48)*L2^2*m_2*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_1+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_1+L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1^2+L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1^2+L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2+L2*cos(theta_2)*eefY+L2*eefX*sin(theta_2)+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_2+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_2+L3*eefY+eenZ`;
    n[1] = `(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1+(-1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_3^2+(-1/2)*L2*g*m_2*sin(theta_0)*sin(theta_1)+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_2*theta_dot_dot_1*w_2^2+(1/12)*m_2*theta_dot_dot_2*w_2^2+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L2*cos(theta_1)*m_2*theta_dot_dot_1+(1/2)*L1*L2*m_2*sin(theta_1)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_3+(1/2)*L2*cos(theta_0)*cos(theta_1)*g*m_2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(13/48)*L2^2*m_2*theta_dot_dot_1+(13/48)*L2^2*m_2*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_3-L2*L3*m_3*sin(theta_2)*theta_dot_2*theta_dot_3-L2*cos(theta_2)^2*g*m_3*sin(theta_0)*sin(theta_1)-L2*g*m_3*sin(theta_0)*sin(theta_1)*sin(theta_2)^2+L1*L2*cos(theta_1)*cos(theta_2)^2*m_3*theta_dot_dot_1+L1*L2*cos(theta_1)*m_3*sin(theta_2)^2*theta_dot_dot_1+L1*L2*cos(theta_2)^2*m_3*sin(theta_1)*theta_dot_1^2+L1*L2*m_3*sin(theta_1)*sin(theta_2)^2*theta_dot_1^2+L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+L2*cos(theta_0)*cos(theta_1)*cos(theta_2)^2*g*m_3+L2*cos(theta_0)*cos(theta_1)*g*m_3*sin(theta_2)^2+L2*cos(theta_2)*eefY+L2*eefX*sin(theta_2)+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_1+L2^2*cos(theta_2)^2*m_3*theta_dot_dot_2+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_1+L2^2*m_3*sin(theta_2)^2*theta_dot_dot_2+L3*eefY+eenZ`;
    // console.log(n[1]);
    // const n2 = nerdamer('matget(n_2, 2, 0)');
    // console.log(n2.expand().text('fractions'));
    // OLD & WRONG: n[2] = `(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_2^2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(1/48)*L3^2*m_3*theta_dot_dot_3+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_2+L3*eefY+eenZ`;
    n[2] = `(-1/2)*L1*L3*m_3*sin(theta_1)*sin(theta_2)*theta_dot_dot_1+(-1/2)*L3*cos(theta_0)*g*m_3*sin(theta_1)*sin(theta_2)+(-1/2)*L3*cos(theta_1)*g*m_3*sin(theta_0)*sin(theta_2)+(-1/2)*L3*cos(theta_2)*g*m_3*sin(theta_0)*sin(theta_1)+(1/12)*m_3*theta_dot_dot_1*w_3^2+(1/12)*m_3*theta_dot_dot_2*w_3^2+(1/12)*m_3*theta_dot_dot_3*w_3^2+(1/2)*L1*L3*cos(theta_1)*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L1*L3*cos(theta_1)*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L1*L3*cos(theta_2)*m_3*sin(theta_1)*theta_dot_1^2+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_1+(1/2)*L2*L3*cos(theta_2)*m_3*theta_dot_dot_2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_1^2+(1/2)*L2*L3*m_3*sin(theta_2)*theta_dot_2^2+(1/2)*L3*cos(theta_0)*cos(theta_1)*cos(theta_2)*g*m_3+(13/48)*L3^2*m_3*theta_dot_dot_1+(13/48)*L3^2*m_3*theta_dot_dot_2+(13/48)*L3^2*m_3*theta_dot_dot_3+L2*L3*m_3*sin(theta_2)*theta_dot_1*theta_dot_2+L3*eefY+eenZ`;
    // const n3 = nerdamer('matget(n_3, 2, 0)');
    // console.log(n3.expand().text('fractions'));
    // console.log(n[2]);

    // console.log(nerdamer('matget(n_2, 2, 0)').expand().text('fractions').split('+').join(' + ').split('-').join(' - '));
    // console.log(nerdamer('matget(n_3, 2, 0)').expand().text('fractions').split('+').join(' + ').split('-').join(' - '));

    const G: string[] = [];
    const V: string[] = [];
    const MM: string[][] = [[], [], []];

    for (var i = 0; i < 3; i++) {
      const nMod = n[i].split('+').join('§+').split('-').join('§-').split('§+(§-1/2)').join('§-(1/2)').split('(§-1/2)').join('-(1/2)');
      const parts = nMod.split('§');
      G[i] = '';
      V[i] = '';
      MM[i][0] = '';
      MM[i][1] = '';
      MM[i][2] = '';
      for (var j = 0; j < parts.length; j++) {
        if (parts[j].includes('g')) {
          G[i] += `+(${parts[j]})`;
        }
        else if (parts[j].includes('theta_dot_dot_1')) {
          MM[i][0] += `+(${parts[j]})`.split('*theta_dot_dot_1').join('');
        }
        else if (parts[j].includes('theta_dot_dot_2')) {
          MM[i][1] += `+(${parts[j]})`.split('*theta_dot_dot_2').join('');
        }
        else if (parts[j].includes('theta_dot_dot_3')) {
          MM[i][2] += `+(${parts[j]})`.split('*theta_dot_dot_3').join('');
        }
        else if (parts[j].includes('theta_dot_')) {
          V[i] += `+(${parts[j]})`;
        }
        // if (parts[i].includes('theta_dot_dot_'))
      }
    }

    const V_vector = nerdamer(`matrix([${V[0]}], [${V[1]}], [${V[2]}])`);
    const G_vector = nerdamer(`matrix([${G[0]}], [${G[1]}], [${G[2]}])`);
    const TDD_vector = nerdamer(`matrix([${tddZeroIsIgnored[1]}], [${tddZeroIsIgnored[2]}], [${tddZeroIsIgnored[3]}])`);
    const MM_matrix = nerdamer(`matrix([${MM[0][0]}, ${MM[0][1]}, ${MM[0][2]}], [${MM[1][0]}, ${MM[1][1]}, ${MM[1][2]}], [${MM[2][0]}, ${MM[2][1]}, ${MM[2][2]}])`)
    const res = nerdamer(`(${MM_matrix}*${TDD_vector})+${V_vector}+${G_vector}`, { 
      theta_0: t[0].toString(), theta_1: t[1].toString(), theta_2: t[2].toString(),
      theta_dot_1: tdZeroIsIgnored[1].toString(), theta_dot_2: tdZeroIsIgnored[2].toString(), theta_dot_3: tdZeroIsIgnored[3].toString(),
      theta_dot_dot_1: tddZeroIsIgnored[1].toString(), theta_dot_dot_2: tddZeroIsIgnored[2].toString(), theta_dot_dot_3: tddZeroIsIgnored[3].toString(),
      L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString(), m_1: m[1].toString(), m_2: m[2].toString(), m_3: m[3].toString(),
      w_1: w[1].toString(), w_2: w[2].toString(), w_3: w[3].toString(), g: g.toString(),
      eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
    }).evaluate();
    // console.log("Automatic reshuffle");
    // console.log(nerdamer(`matget(${res}, 0, 0)`).text('decimals'));
    // console.log(nerdamer(`matget(${res}, 1, 0)`).text('decimals'));
    // console.log(nerdamer(`matget(${res}, 2, 0)`).text('decimals'));

    return vector([
      parseFloat(nerdamer(`matget(${res}, 0, 0)`).text('decimals')),
      parseFloat(nerdamer(`matget(${res}, 1, 0)`).text('decimals')),
      parseFloat(nerdamer(`matget(${res}, 2, 0)`).text('decimals')),
    ]);
    

    // const solvedN1 = nerdamer(n[0], { 
    //   theta_0: t[0].toString(), theta_1: t[1].toString(), theta_2: t[2].toString(),
    //   theta_dot_1: tdZeroIsIgnored[1].toString(), theta_dot_2: tdZeroIsIgnored[2].toString(), theta_dot_3: tdZeroIsIgnored[3].toString(),
    //   theta_dot_dot_1: tddZeroIsIgnored[1].toString(), theta_dot_dot_2: tddZeroIsIgnored[2].toString(), theta_dot_dot_3: tddZeroIsIgnored[3].toString(),
    //   L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString(), m_1: m[1].toString(), m_2: m[2].toString(), m_3: m[3].toString(),
    //   w_1: w[1].toString(), w_2: w[2].toString(), w_3: w[3].toString(), g: g.toString(),
    //   eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
    // });
    // const solvedN2 = nerdamer(n[1], { 
    //   theta_0: t[0].toString(), theta_1: t[1].toString(), theta_2: t[2].toString(),
    //   theta_dot_1: tdZeroIsIgnored[1].toString(), theta_dot_2: tdZeroIsIgnored[2].toString(), theta_dot_3: tdZeroIsIgnored[3].toString(),
    //   theta_dot_dot_1: tddZeroIsIgnored[1].toString(), theta_dot_dot_2: tddZeroIsIgnored[2].toString(), theta_dot_dot_3: tddZeroIsIgnored[3].toString(),
    //   L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString(), m_1: m[1].toString(), m_2: m[2].toString(), m_3: m[3].toString(),
    //   w_1: w[1].toString(), w_2: w[2].toString(), w_3: w[3].toString(), g: g.toString(),
    //   eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
    // });
    // const solvedN3 = nerdamer(n[2], { 
    //   theta_0: t[0].toString(), theta_1: t[1].toString(), theta_2: t[2].toString(),
    //   theta_dot_1: tdZeroIsIgnored[1].toString(), theta_dot_2: tdZeroIsIgnored[2].toString(), theta_dot_3: tdZeroIsIgnored[3].toString(),
    //   theta_dot_dot_1: tddZeroIsIgnored[1].toString(), theta_dot_dot_2: tddZeroIsIgnored[2].toString(), theta_dot_dot_3: tddZeroIsIgnored[3].toString(),
    //   L1: L[1].toString(), L2: L[2].toString(), L3: L[3].toString(), m_1: m[1].toString(), m_2: m[2].toString(), m_3: m[3].toString(),
    //   w_1: w[1].toString(), w_2: w[2].toString(), w_3: w[3].toString(), g: g.toString(),
    //   eefX: FN[0].toString(), eefY: FN[1].toString(), eenZ: FN[2].toString()
    // });

    // console.log("OG Form right after combining equations:");
    // console.log(solvedN1.evaluate().text('decimals'));
    // console.log(solvedN2.evaluate().text('decimals'));
    // console.log(solvedN3.evaluate().text('decimals'));

    // const model = nerdamer(`((((((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*cos(theta_2)+((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*sin(theta_2)-0.5*(theta_dot_1+theta_dot_2+theta_dot_3)^2*L3)*m_3+eefX)*cos(theta_2)+((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-0.5*(theta_dot_1+theta_dot_2)^2*L2)*m_2-((((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*cos(theta_2)-((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*sin(theta_2)+0.5*(theta_dot_dot_1+theta_dot_dot_2)*L3)*m_3+eefY)*sin(theta_2))*sin(theta_1)+(((((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*cos(theta_2)+((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*sin(theta_2)-0.5*(theta_dot_1+theta_dot_2+theta_dot_3)^2*L3)*m_3+eefX)*sin(theta_2)+((((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*cos(theta_2)-((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*sin(theta_2)+0.5*(theta_dot_dot_1+theta_dot_dot_2)*L3)*m_3+eefY)*cos(theta_2)+((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1)+0.5*L2*theta_dot_dot_1)*m_2)*cos(theta_1))*L1+(((((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*cos(theta_2)+((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*sin(theta_2)-0.5*(theta_dot_1+theta_dot_2+theta_dot_3)^2*L3)*m_3+eefX)*sin(theta_2)+((((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*cos(theta_2)-((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*sin(theta_2)+0.5*(theta_dot_dot_1+theta_dot_dot_2)*L3)*m_3+eefY)*cos(theta_2))*L2+0.08333333333333333*(0.25*L1^2+w_1^2)*m_1*theta_dot_dot_1+0.08333333333333333*(0.25*L2^2+w_2^2)*(theta_dot_dot_1+theta_dot_dot_2)*m_2+0.08333333333333333*(0.25*L3^2+w_3^2)*(theta_dot_dot_1+theta_dot_dot_2+theta_dot_dot_3)*m_3+0.5*(((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)+(theta_dot_dot_1+theta_dot_dot_2)*L2-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1))*cos(theta_2)-((-L1*theta_dot_1^2+g*sin(theta_0))*cos(theta_1)+(L1*theta_dot_dot_1+cos(theta_0)*g)*sin(theta_1)-(theta_dot_1+theta_dot_2)^2*L2)*sin(theta_2)+0.5*(theta_dot_dot_1+theta_dot_dot_2)*L3)*L3*m_3+0.5*((L1*theta_dot_dot_1+cos(theta_0)*g)*cos(theta_1)-(-L1*theta_dot_1^2+g*sin(theta_0))*sin(theta_1)+0.5*L2*theta_dot_dot_1)*L2*m_2+0.5*L1*cos(theta_0)*g*m_1+L3*eefY+eenZ`)

    // nerdamer.setConstant('eefX', 0);
    // nerdamer.setConstant('eefY', 0);
    // nerdamer.setConstant('eenZ', 0);

    // console.log(model.evaluate().text());

  }

}