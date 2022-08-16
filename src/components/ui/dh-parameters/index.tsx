import React, { useState } from "react";
import { useInputTypeContext } from "../../../utils/inputTypeContext";
import { DHTable, DHTableRow, RobotLinkLengths } from "../../../utils/useKinematicInfo";
import { Input } from "../input";
import { InputType } from "../input-type";

type n = React.Dispatch<React.SetStateAction<number>>;
type ns = React.Dispatch<React.SetStateAction<number[]>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;
type d = React.Dispatch<React.SetStateAction<DHTable>>

interface Props {
  robotType: string, setRobotType: React.Dispatch<React.SetStateAction<string>>,
  linkLengths: RobotLinkLengths, setLinkLengths: React.Dispatch<React.SetStateAction<RobotLinkLengths>>
  applyLinkLengthChange: boolean, setApplyLinkLengthChange: b
  applyRobotTypeChange: boolean, setApplyRobotTypeChange: b
  dhParameters: DHTable, setDhParameters: d
  applyDhChange: boolean, setApplyDhChange: b
}

export const DHParametersUI: React.FC<Props> = ({
  robotType, setRobotType, linkLengths, setLinkLengths, setApplyLinkLengthChange, setApplyRobotTypeChange, dhParameters, setDhParameters, setApplyDhChange
}) => {
  const c = useInputTypeContext();
  const [ counter, setCounter ] = useState(0);
  return <>
    <div>
      <table><tbody>{
        [...Array(5).keys()].map(i => <tr key={i + 1}>
          <td>{i + 1}</td>
          <td><input type={'number'} placeholder={`a_i-1`} value={dhParameters.params[i].a_imin1} onChange={(e) => { const v = e.currentTarget.value; setDhParameters(dh => { dh.params[i].a_imin1 = parseFloat(v); dh.updateCounter += 1; return dh }); setApplyDhChange(true); setCounter(c => c += 1)}} /></td>
          <td><input type={'number'} placeholder={`alpha_i-1`} value={dhParameters.params[i].alpha_imin1} onChange={(e) => { const v = e.currentTarget.value; setDhParameters(dh => { dh.params[i].alpha_imin1 = parseFloat(v); dh.updateCounter += 1; return dh }); setApplyDhChange(true); setCounter(c => c += 1)}}/></td>
          <td>{ robotType[i] == 'P' ? <></> : <input type={'number'} placeholder={`d_i`} value={dhParameters.params[i].d_i} onChange={(e) => { const v = e.currentTarget.value; setDhParameters(dh => { dh.params[i].d_i = parseFloat(v); dh.updateCounter += 1; return dh }); setApplyDhChange(true); setCounter(c => c += 1)}}/> }</td>
          <td>{ robotType[i] == 'R' ? <></> : <input type={'number'} placeholder={`theta_i`} value={dhParameters.params[i].theta_i} onChange={(e) => { const v = e.currentTarget.value; setDhParameters(dh => { dh.params[i].theta_i = parseFloat(v); dh.updateCounter += 1; return dh }); setApplyDhChange(true); setCounter(c => c += 1)}}/> }</td>
        </tr>)
      }</tbody></table>

    </div>
  </>
}