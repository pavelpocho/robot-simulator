import React, { useState } from "react";
import { useInputTypeContext } from "../../../utils/inputTypeContext";
import { RobotLinkLengths } from "../../../utils/useKinematicInfo";
import { Input } from "../input";
import { InputType } from "../input-type";

type n = React.Dispatch<React.SetStateAction<number>>;
type ns = React.Dispatch<React.SetStateAction<number[]>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  robotType: string, setRobotType: React.Dispatch<React.SetStateAction<string>>,
  linkLengths: RobotLinkLengths, setLinkLengths: React.Dispatch<React.SetStateAction<RobotLinkLengths>>
  applyLinkLengthChange: boolean, setApplyLinkLengthChange: b
  applyRobotTypeChange: boolean, setApplyRobotTypeChange: b
}

export const RobotTypeUI: React.FC<Props> = ({
  robotType, setRobotType, linkLengths, setLinkLengths, setApplyLinkLengthChange, setApplyRobotTypeChange
}) => {
  const c = useInputTypeContext();
  const [ counter, setCounter ] = useState(0);
  return <>
    <div>
      <div>
        <input disabled={false} title="Robot type" value={robotType} type="text" onChange={(e) => {setRobotType(e.currentTarget.value); setApplyRobotTypeChange(true)}} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
      { linkLengths.values.map((l, i) => {
        if (i == 0) return null;
        return <Input key={i} label={`Link ${i}`} value={l} disabled={false} setValue={(v: number) => {
          setLinkLengths(ls => { ls.values[i] = v; return ls });
          setApplyLinkLengthChange(true);
        }} />
      }) }
      </div>
    </div>
  </>
}