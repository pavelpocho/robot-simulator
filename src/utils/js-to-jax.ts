import nerdamer from "nerdamer";

const lastLast = (array: string[][]) => array[array.length - 1][array[array.length - 1].length - 1];

export const jsMatrixToJax = (jsString: string) => {
  const matrixElements = jsString.split('matrix(')[1].slice(0, -1).split('],[');
  const mES = matrixElements.map(m => m.split(','));
  while (mES[0][0].at(0) == '[') {
    mES[0][0] = mES[0][0].slice(1, mES[0][0].length);
  }
  while (lastLast(mES).at(-1) == ']') {
    mES[mES.length - 1][mES[mES.length - 1].length - 1] = lastLast(mES).slice(0, -1);
  }
  return mES.map(mE => mE.map(m => jsNumberToJax(m)));
}

export const jsVectorToJax = (jsString: string) => {
  const vectorElements = jsString.split('matrix(')[1].slice(0, -1).split('],[');
  vectorElements[0] = vectorElements[0].slice(1, vectorElements[0].length);
  vectorElements[vectorElements.length - 1] = vectorElements[vectorElements.length - 1].slice(0, -1);
  return vectorElements.map(v => jsNumberToJax(v));
}

export const jsNumberToJax = (jsString: string) => {
  const tds = jsString.replace('+(-1)', '-').replace('(-1)', '-').replace(/td[0-9]/g, (match) => String.raw`\dot{\theta}_${match[2]}`);
  const dds = tds.replace(/dd[0-9]/g, (match) => String.raw`\dot{d}_${match[2]}`);
  const bracketsRem = dds.replace(/\(t[0-9]\)/g, (match) => String.raw`${match.slice(1, -1)}`);
  const ts = bracketsRem.replace(/t[0-9]/g, (match) => String.raw`\theta_${match[1]}`);
  const sin = ts.replace(/sin/g, 's');
  const cos = sin.replace(/cos/g, 'c');
  const multi = cos.replace(/\*/g, '');
  const result = multi;
  return result;
}