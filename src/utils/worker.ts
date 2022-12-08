import { Robot } from './contexts/RobotContext';
import nerdamer from 'nerdamer';

onmessage = (ev: MessageEvent<Robot>) => {
  console.log('onmessage in worker');
  postMessage(getCompiledJacobian(ev.data));
  console.log('posted message');
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

  console.log('got over robot type');

  // Here rotationMatrices[0] corresponds to DH row 1, aka. representing frame 1 in frame 0 (0 on top, 1 on bottom, aka. R01)
  // Here transposedRotationMatrices[0] corresponds to inverse of DH row 1, aka. representing frame 0 in frame 1 (1 on top, 0 on bottom, aka. R10)
  // So on... until:
  // rotationMatrices[i] is max, where i is number of joints and rotationMatrices[i] points to the End effector
  // So:

  for (let i = 0; i < rotationMatrices.length; i++) {
    nerdamer.setVar(`R${i}${i+1}`, rotationMatrices[i].text('fractions'));
    // console.log(nerdamer(`R${i}${i+1}`).text());
    nerdamer.setVar(`R${i+1}${i}`, transposedRotationMatrices[i].text('fractions'));
  }

  console.log('vvv');

  // for (let i = 0; i < robot?.dhTable.length; i++) {
  //   if (robot?.dhTable[i].alpha_i_minus_1 == 0) nerdamer.setVar(`d${i}`, 0);
  // }

  nerdamer.setVar('omega_0', 'matrix([0], [0], [0])');
  nerdamer.setVar('v_0', 'matrix([0], [0], [0])');

  for (let i = 1; i <= robot.type.length; i++) {
    console.log('i', i);
    if (robot.type[i-1] === 'R') {
      nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})+(matrix([0],[0],[td${i}]))`);
      const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
      nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))`);
    }
    else if (robot.type[i-1] === 'P') {
      nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})`);
      const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
      nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))+(matrix([0],[0],[dd${i}]))`);
    }
    else if (robot.type[i-1] === 'E') {
      console.log('e1');
      nerdamer.setVar(`omega_${i}`, `(R${i}${i-1}*omega_${i-1})`);
      console.log('e2');
      const vectorizedOmega = nerdamer(`[matget(omega_${i-1}, 0, 0), matget(omega_${i-1}, 1, 0), matget(omega_${i-1}, 2, 0)]`).text();
      console.log('e3');
      console.log(`(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))`);
      console.log(`v_${i}`);
      nerdamer.setVar(`v_${i}`, `(R${i}${i-1})*(v_${i-1}+(cross(${vectorizedOmega}, ${translationVectors[i-1]})))`); 
      console.log('e4');
    }
  }

  console.log('eqs expanded');

  for (let i = 0; i < robot.dhTable.length; i++) {
    const a = `a${i}`;
    const al = `al${i}`;
    nerdamer.setVar(a, robot.dhTable[i].a_i_minus_1);
    nerdamer.setVar(al, robot.dhTable[i].alpha_i_minus_1);
  }

  // This is to get rid of the 'joint' variables which represent the moving and rotating of the end effector, i.e. something
  // that is not possible
  nerdamer.setVar(`t${robot.dhTable.length}`, 0);
  nerdamer.setVar(`d${robot.dhTable.length}`, 0);

  console.log('vars set');

  // These should now be the final (End effector) values
  const all_vs = robot.type.split('').map((_, i) => nerdamer(nerdamer.getVars('text')[`v_${i+1}`]).evaluate().text('fractions'));
  const all_omegas = robot.type.split('').map((_, i) => nerdamer(nerdamer.getVars('text')[`omega_${i+1}`]).evaluate().text('fractions'));

  console.log('done');

  return { all_vs: all_vs.join(';'), all_omegas: all_omegas.join(';') }
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



const lastLast = (array: string[][]) => array[array.length - 1][array[array.length - 1].length - 1];

export const applyTrig = (jsString: string) => {
  const matrixElements = jsString.split('matrix(')[1].slice(0, -1).split('],[');
  const mES = matrixElements.map(m => m.split(','));
  while (mES[0][0].at(0) == '[') {
    mES[0][0] = mES[0][0].slice(1, mES[0][0].length);
  }
  while (lastLast(mES).at(-1) == ']') {
    mES[mES.length - 1][mES[mES.length - 1].length - 1] = lastLast(mES).slice(0, -1);
  }
  return 'matrix([' + mES.map(mE => mE.map(m => applyTrigToNumber(m))).join('],[') + '])';
}

const splitStringAtIndexes = (str: string, indexes: number[]) =>  {
  const sections = [];
  for (let i = 0; i < indexes.length; i++) {
    sections.push(str.slice(i == 0 ? 0 : (indexes[i - 1] + 1), indexes[i]));
  }
  sections.push(str.slice(indexes[indexes.length - 1] + 1));
  return sections;
}


const splitByMasterPluses = (inp: string) => {
  const spl = inp.split('');
  const indexesToSplitAt: number[] = [];
  let rollingNumberOfBrackets = 0;
  spl.forEach((s, i, a) => {
    if (s == '(') {
      rollingNumberOfBrackets += 1;
    }
    else if (s == ')') {
      rollingNumberOfBrackets -= 1;
    }
    else if (s == '+' && rollingNumberOfBrackets == 0 && a[i-1] != 'e') {
      indexesToSplitAt.push(i);
    }
  });
  return splitStringAtIndexes(inp, indexesToSplitAt);
}

export const applyTrigToNumber = (jsString: string) => {
  // This can only do 0 - 9, so there is a limit of 9 joints...
  const expanded1 = nerdamer(`expand(${jsString})`).text().split('');
  for (let i = 0; i < expanded1.length; i++) {
    if (expanded1[i] == '-' && expanded1[i-1] != 'e') {
      expanded1.splice(i, 1, '+(-1)*');
    }
  }
  const expanded = splitByMasterPluses(expanded1.join(''));
  const powersExpanded = expanded.map(e => {
    const starSplits = e.split('*');
    const powerExpandedStarSplits = starSplits.map(s => {
      if (s.includes('^')) {
        const i = s.indexOf('^');
        const power = s[i + 1];
        const thingPowered = s.slice(0, i);
        return Array(parseInt(power)).fill(thingPowered).join('*');
      }
      else return s;
    });
    return powerExpandedStarSplits.join('*');
  });
  const trigApplied = applyTrigIdentities(powersExpanded);
  return trigApplied.join('+');
}

const applyTrigIdentities = (powersExpanded: string[]): string[] => {
  const applied = applyTrigIdentitiesOnce(powersExpanded);
  // if (applied != powersExpanded) {
  //   // console.log('--- Before: ');
  //   // console.log(powersExpanded);
  //   // console.log('--- After: ');
  //   // console.log(applied);
  // }
  // else {
  //   console.log('Equal!');
  // }
  if (applied != powersExpanded) {
    return applyTrigIdentities(applied);
  }
  else {
    return applied;
  }
}

const applyTrigIdentitiesOnce = (input: string[]) => {
  for (let i = 0; i < input.length; i++) {
    const section1 = input[i];
    for (let j = 0; j < input.length; j++) {
      const section2 = input[j];
      const combined = combineTwoSections(section1, section2);
      if (combined != null) {
        return input.filter(x => x != section1 && x != section2).concat([ combined ]);
      }
    }
  }
  return input;
}

const combineTwoSections = (section1: string, section2: string) => {
  const parts1 = section1.split('*');
  const parts2 = section2.split('*');
  if (parts1.filter(p => p != '(-1)').length != parts2.filter(p => p != '(-1)').length) return null;
  // We trust here that this works correctly and we don't need to check it both ways
  const sameParts = parts1.filter(p => parts2.includes(p));
  const uniqueParts1 = parts1.filter(p => !sameParts.includes(p));
  const uniqueParts2 = parts2.filter(p => !sameParts.includes(p));
  const satisfied = checkCombiningCondition(section1 == 'a1*cos(al1)*sin(t2)*td1', uniqueParts1.filter(p => p != '(-1)'), uniqueParts1.includes('(-1)'), uniqueParts2.filter(p => p != '(-1)'), uniqueParts2.includes('(-1)'));
  if (satisfied) {
    const newThing = sameParts.concat(satisfied);
    if (getNumberOfMin1sInList(newThing) == 2) {
      return newThing.filter(t => t != '(-1)').join('*');
    }
    else {
      return newThing.join('*');
    }
  }
  else {
    return null;
  }
}

const getNumberOfMin1sInList = (list: string[]) => list.filter(l => l == '(-1)').length;

const checkCombiningCondition = (log: boolean, uniqueParts1: string[], uP1isNegated: boolean, uniqueParts2: string[], uP2isNegated: boolean) => {
  const trigObjects1 = uniqueParts1.map(u => getTrigObject(u));
  const trigObjects2 = uniqueParts2.map(u => getTrigObject(u));
  if (trigObjects1.concat(trigObjects2).filter(t => t == null).length > 0) {
    return null;
  }
  if (trigObjects1.length != 2 || trigObjects2.length != 2) {
    return null;
  }
  const uniqueSymbols1 = trigObjects1.filter(t => !trigObjects2.map(o => o?.param).includes(t?.param));
  const uniqueSymbols2 = trigObjects2.filter(t => !trigObjects1.map(o => o?.param).includes(t?.param));
  if (uniqueSymbols1.length != 0 || uniqueSymbols2.length != 0) {
    return null;
  }

  // Cosine angle sum/diff theorem
  const foundSame = (
    (trigObjects1.every(t => t?.fn == 'sin') && trigObjects2.every(t => t?.fn == 'cos')) || 
    (trigObjects1.every(t => t?.fn == 'cos') && trigObjects2.every(t => t?.fn == 'sin'))
  )
  if (foundSame) {
    const sinIndex = trigObjects1.every(t => t?.fn == 'sin') ? 0 : 1;
    const cosIndex = trigObjects1.every(t => t?.fn == 'cos') ? 0 : 1;
    const negatedIndexes = [ uP1isNegated, uP2isNegated ];
    const paramsToBeInserted = [trigObjects1[0]?.param, trigObjects1[1]?.param];
    paramsToBeInserted.sort();
    if (negatedIndexes[sinIndex] && !negatedIndexes[cosIndex]) {
      return [`cos(${paramsToBeInserted[0]}+${paramsToBeInserted[1]})`];
    }
    else if (!negatedIndexes[sinIndex] && negatedIndexes[cosIndex]) {
      return ['(-1)', `cos(${paramsToBeInserted[0]}+${paramsToBeInserted[1]})`];
    }
    else if (!negatedIndexes[sinIndex] && !negatedIndexes[cosIndex]) {
      if (paramsToBeInserted[0] == paramsToBeInserted[1]) {
        return [`cos(0)`];
      }
      return [`cos(${paramsToBeInserted[0]}-${paramsToBeInserted[1]})`];
    }
    else if (negatedIndexes[sinIndex] && negatedIndexes[cosIndex]) {
      if (paramsToBeInserted[0] == paramsToBeInserted[1]) {
        return ['(-1)', `cos(0)`];
      }
      return ['(-1)', `cos(${paramsToBeInserted[0]}-${paramsToBeInserted[1]})`];
    }
  }

  trigObjects1.sort((a, b) => (((a?.param ?? '') > (b?.param ?? '')) ? -1 : 1));
  trigObjects2.sort((a, b) => (((a?.param ?? '') > (b?.param ?? '')) ? -1 : 1));

  // Sine angle summ/diff theorem
  const foundOpposite = (
    trigObjects1[0]?.fn != trigObjects2[0]?.fn && trigObjects1[1]?.fn != trigObjects2[1]?.fn
  )
  if (foundOpposite) {
    const indexOfSineIn1 = trigObjects1.findIndex(t => t?.fn == 'sin');
    const indexOfSineIn2 = trigObjects2.findIndex(t => t?.fn == 'sin');
    const paramOfSine1 = trigObjects1[indexOfSineIn1]?.param;
    const paramOfSine2 = trigObjects2[indexOfSineIn2]?.param;
    if (uP1isNegated && uP2isNegated) {
      const sortedThings = [paramOfSine1, paramOfSine2];
      sortedThings.sort();
      return ['(-1)', `sin(${paramOfSine1}+${paramOfSine2})`];
    }
    if ((paramOfSine1 ?? '') > (paramOfSine2 ?? '')) {
      return [`sin(${uP2isNegated ? '-' : ''}${paramOfSine2}${uP1isNegated ? '-' : '+'}${paramOfSine1})`];
    }
    else {
      return [`sin(${uP1isNegated ? '-' : ''}${paramOfSine1}${uP2isNegated ? '-' : '+'}${paramOfSine2})`];
    }
    
  }

  // Check for special case of sine angle thing where the angles are the same
  const specialCase = (
    trigObjects1.map(t => t?.fn).includes('sin') && trigObjects1.map(t => t?.fn).includes('cos') &&
    trigObjects2.map(t => t?.fn).includes('sin') && trigObjects2.map(t => t?.fn).includes('cos') &&
    trigObjects1[0]?.param === trigObjects2[0]?.param
  )

  if (specialCase) {
    if ((uP1isNegated && !uP2isNegated) || (uP2isNegated && !uP1isNegated)) {
      return ['0'];
    }
    return [`${uP1isNegated && uP2isNegated ? '-' : ''}sin(${trigObjects1[0]?.param}+${trigObjects1[0]?.param})`];
  }

  // console.log('found nothing...');
  return null;
}

const getTrigObject = (expr: string) => (!expr.includes('sin') && !expr.includes('cos') ? null : {
  fn: expr.split('(')[0],
  param: expr.split('(')[1].split(')')[0]
});