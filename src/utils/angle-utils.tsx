import { abs, acos, atan2, cos, MathArray, sin, sqrt } from "mathjs"
import vector from "./vector";

export const getXYZFixedAngles = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];

  const beta = atan2(-r[2][0], sqrt(r[0][0]**2+r[1][0]**2));
  const alpha = abs(beta) === Math.PI / 2 ? 0 : atan2(r[1][0] / cos(beta), r[0][0] / cos(beta));
  const gamma = abs(beta) === Math.PI / 2 ? ((beta < 0 ? -1 : 1) * atan2(r[0][1], r[1][1])) : atan2(r[2][1] / cos(beta), r[2][2] / cos(beta));

  return [ gamma, beta, alpha ]; // (x, y, z)
}

// Same as fixed but reversed
export const getZYXEulerAngles = (transformationMatrix: MathArray) => {
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


// Seems broken m8
export const getEqAnAx = (transformationMatrix: MathArray) => {
  const r = transformationMatrix as number[][];

  const theta = acos((r[0][0] + r[1][1] + r[2][2] - 1) / 2);
  const kHatX = 1/(2 * sin(theta)) * (r[2][1] - r[1][2]);
  const kHatY = 1/(2 * sin(theta)) * (r[0][2] - r[2][0]);
  const kHatZ = 1/(2 * sin(theta)) * (r[1][0] - r[0][1]);

  return [ theta, kHatX, kHatY, kHatZ ]; // (angle, axis X, axis Y, axis Z)
}

