import { abs, acos, atan2, cos, MathArray, matrix, sin, sqrt } from "mathjs"

export const getXYZFixedAngles = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];

  const beta = atan2(-r[2][0], sqrt(r[0][0]**2+r[1][0]**2));
  const alpha = abs(beta) === Math.PI / 2 ? 0 : atan2(r[1][0] / cos(beta), r[0][0] / cos(beta));
  const gamma = abs(beta) === Math.PI / 2 ? ((beta < 0 ? -1 : 1) * atan2(r[0][1], r[1][1])) : atan2(r[2][1] / cos(beta), r[2][2] / cos(beta));

  return [ gamma, beta, alpha ]; // (x, y, z)
}

// Same as fixed but reversed
export const getZYXCardanoAngles = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];

  const beta = atan2(-r[2][0], sqrt(r[0][0]**2+r[1][0]**2));
  const alpha = abs(beta) === Math.PI / 2 ? 0 : atan2(r[1][0] / cos(beta), r[0][0] / cos(beta));
  const gamma = abs(beta) === Math.PI / 2 ? ((beta < 0 ? -1 : 1) * atan2(r[0][1], r[1][1])) : atan2(r[2][1] / cos(beta), r[2][2] / cos(beta));

  return [ alpha, beta, gamma ]; // (z, y, x)
}

export const getZYZEulerAngles = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];
  
  const beta = atan2(sqrt(r[2][0]**2 + r[2][1]**2), r[2][2]);
  const alpha = beta === 0 ? 0 : atan2(r[1][2] / sin(beta), r[0][2] / sin(beta));
  const gamma = beta === 0 ? atan2(-r[0][1], r[0][0]) : atan2(r[2][1] / sin(beta), -r[2][0] / sin(beta));

  return [ alpha, beta, gamma ]; // (first z, then y, then z)
}

export const getInverseZYZEulerAngles = (alpha: number, beta: number, gamma: number) => {
  const ca = cos(alpha);
  const sa = sin(alpha);
  const cb = cos(beta);
  const sb = sin(beta);
  const cg = cos(gamma);
  const sg = sin(gamma);
  return matrix([
    [ ca*cb*cg - sa*sg, -ca*cb*sg-sa*cg, ca*sb ],
    [ sa*cb*cg - ca*sg, -sa*cb*sg+ca*cg, sa*sb ],
    [ -sb*cg, sb*sg, cb ]
  ]);
}

/**
 * Be careful about the order
 * @param alpha: Rotation about Z Axis
 * @param beta: Rotation about Y Axis
 * @param gamma: Rotation about X Axis
 */
export const getInverseXYZFixedAngles = (alpha: number, beta: number, gamma: number) => {
  const ca = cos(alpha);
  const sa = sin(alpha);
  const cb = cos(beta);
  const sb = sin(beta);
  const cg = cos(gamma);
  const sg = sin(gamma);
  return matrix([
    [ ca*cb, ca*sb*sg - sa*cg, ca*sb*cg + sa*sg ],
    [ sa*cb, sa*sb*sg + ca*cg, sa*sb*cg - ca*sg ],
    [ -sb, cb*sg, cb*cg ]
  ]);
}

/**
 * Be careful about the order
 * @param alpha: Rotation about Z Axis
 * @param beta: Rotation about Y Axis
 * @param gamma: Rotation about X Axis
 */
 export const getInverseZYXCardanoAngles = (alpha: number, beta: number, gamma: number) => {
  const ca = cos(alpha);
  const sa = sin(alpha);
  const cb = cos(beta);
  const sb = sin(beta);
  const cg = cos(gamma);
  const sg = sin(gamma);
  return matrix([
    [ ca*cb, ca*sb*sg - sa*cg, ca*sb*cg + sa*sg ],
    [ sa*cb, sa*sb*sg + ca*cg, sa*sb*cg - ca*sg ],
    [ -sb, cb*sg, cb*cg ]
  ]);
}


// Looks good
export const getEqAnAx = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];

  const theta = acos((r[0][0] + r[1][1] + r[2][2] - 1) / 2);
  const kHatX = 1/(2 * sin(theta)) * (r[2][1] - r[1][2]);
  const kHatY = 1/(2 * sin(theta)) * (r[0][2] - r[2][0]);
  const kHatZ = 1/(2 * sin(theta)) * (r[1][0] - r[0][1]);

  return [ theta, isNaN(kHatX) ? 0 : kHatX, isNaN(kHatY) ? 0 : kHatY, isNaN(kHatZ) ? 0 : kHatZ ]; // (angle, axis X, axis Y, axis Z)
}

export const getInverseEqAnAx = (kx: number, ky: number, kz: number, t: number) => {
  const ct = cos(t);
  const st = sin(t);
  const vt = 1 - cos(t);
  return matrix([
    [ kx*kx*vt+ct, kx*ky*vt-kz*st, kx*kz*vt+ky*st ],
    [ kx*ky*vt+kz*st, ky*ky*vt+ct, ky*kz*vt-kx*st ],
    [ kx*kz*vt-ky*st, ky*kz*vt+kx*st, kz*kz*vt+ct ],
  ])
}

export const getEulerParams = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];

  const eta = 1/2 * sqrt(1 + r[0][0] + r[1][1] + r[2][2]);
  const epsilon_x = (r[2][1] - r[1][2]) / (4 * eta);
  const epsilon_y = (r[0][2] - r[2][0]) / (4 * eta);
  const epsilon_z = (r[1][0] - r[0][1]) / (4 * eta);

  const sumOfSquares = Math.pow(eta, 2) + Math.pow(epsilon_x, 2) + Math.pow(epsilon_y, 2) + Math.pow(epsilon_z, 2);

  return [ eta, epsilon_x, epsilon_y, epsilon_z ];
}

/**
 * Be careful about the order
 * @param e: Eta
 * @param ex: Epsilon_X
 * @param ey: Epsilon_Y
 * @param ez: Epsilon_Z
 */
export const getInverseEulerParams = (e: number, ex: number, ey: number, ez: number) => matrix([
  [1-2*(ey**2)-2*(ez**2), 2*(ex*ey-ez*e), 2*(ex*ez+ey*e)],
  [2*(ex*ey+ez*e), 1-2*(ex**2)-2*(ez**2), 2*(ey*ez-ex*e)],
  [2*(ex*ez-ey*e), 2*(ey*ez+ex*e), 1-2*(ex**2)-2*(ey**2)],
])
