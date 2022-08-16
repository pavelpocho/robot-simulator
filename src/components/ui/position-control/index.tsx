import React from "react";
import { useInputTypeContext } from "../../../utils/inputTypeContext";
import { Input } from "../input";
import { InputType } from "../input-type";

type n = React.Dispatch<React.SetStateAction<number>>;
type ns = React.Dispatch<React.SetStateAction<number[]>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  angle1: number, setAngle1: n,
  angle2: number, setAngle2: n,
  angle3: number, setAngle3: n,
  y: number, setY: n,
  a: number, setA: n,
  x: number, setX: n,
  setApplyFwdKin: b, setApplyInvKin: b,
  jointPositions: number[], setJointPositions: ns,
  setApplyDhChange: b
}

export const PositionControlUI: React.FC<Props> = ({
  angle1, angle2, angle3, setAngle1, setAngle2, setAngle3,
  x, y, a, setX, setY, setA, setApplyFwdKin, setApplyInvKin,
  jointPositions, setJointPositions, setApplyDhChange
}) => {
  const c = useInputTypeContext();
  return <>
    <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
      { jointPositions.map((jpx, i) => (
        <Input key={i} disabled={c.inputType != InputType.FwdKin} label={`Joint ${i+1} Position`} value={jpx} setValue={(v: number) => {setJointPositions(jp => { jp[i] = v; return jp }); setApplyDhChange(true); setApplyFwdKin(true)}} />
      )) }
    </div>
    <div style={{ display: 'flex' }}>
      <Input disabled={c.inputType != InputType.InvKin} label="X Position" value={x} setValue={(v: number) => {setX(v); setApplyInvKin(true)}} />
      <Input disabled={c.inputType != InputType.InvKin} label="Y Position" value={y} setValue={(v: number) => {setY(v); setApplyInvKin(true)}} />
      <Input disabled={c.inputType != InputType.InvKin} label="EE Angle" value={a} setValue={(v: number) => {setA(v); setApplyInvKin(true)}} />
    </div>
  </>
}