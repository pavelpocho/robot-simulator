import nerdamer from "nerdamer";
import { JacSectionMessage } from "./worker";

onmessage = (ev: MessageEvent<JacSectionMessage>) => {

  const jacobianSection = Array(ev.data.robotType.length - 1).fill('0');
  const splitRow = nerdamer(`expand(matget(${ev.data.i < 3 ? ev.data.v_final : ev.data.omega_final}, ${ev.data.i % 3}, 0))`).text('fractions').split('+(-').join('-(').split('(-').join('-(').split('-').join('+(-1)*').split('+');
  const separatedStrings = Array(ev.data.robotType.length - 1).fill('');
  splitRow.forEach((bit) => {
    for (let j = 0; j < jacobianSection.length; j++) {
      if (bit.includes(`td${j+1}`)) {
        separatedStrings[j] += ((separatedStrings[j] === '' ? '' : '+') + bit.replace(`td${j+1}`, `1`)).replace(/\*1(?![0-9])/g, '').replace(/\(-1\)\*/g, '-');
      }
      if (bit.includes(`dd${j+1}`)) {
        separatedStrings[j] += ((separatedStrings[j] === '' ? '' : '+') + bit.replace(`dd${j+1}`, `1`)).replace(/\*1(?![0-9])/g, '').replace(/\(-1\)\*/g, '-');
      }
    }
  });

  for (let j = 0; j < jacobianSection.length; j++) {
    if (separatedStrings[j].length > 0) jacobianSection[j] = separatedStrings[j];
  }

  postMessage({ i: ev.data.i, jacobianSection });
}