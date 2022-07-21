import React from "react";
import { Input } from "../input";

type n = React.Dispatch<React.SetStateAction<number>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  angle1: number, setAngle1: n,
  angle2: number, setAngle2: n,
  angle3: number, setAngle3: n,
  y: number, setY: n,
  a: number, setA: n,
  x: number, setX: n,
  setApplyFwdKin: b, setApplyInvKin: b
}

export const PositionControlUI: React.FC<Props> = ({
  angle1, angle2, angle3, setAngle1, setAngle2, setAngle3,
  x, y, a, setX, setY, setA, setApplyFwdKin, setApplyInvKin
}) => {
  return <>
    <div style={{ display: 'flex' }}>
      <Input label="Joint 1 Position" value={angle1} setValue={(v) => {setAngle1(v); setApplyFwdKin(true)}} />
      <Input label="Joint 2 Position" value={angle2} setValue={(v) => {setAngle2(v); setApplyFwdKin(true)}} />
      <Input label="Joint 3 Position" value={angle3} setValue={(v) => {setAngle3(v); setApplyFwdKin(true)}} />
    </div>
    <div style={{ display: 'flex' }}>
      <Input label="X Position" value={x} setValue={(v) => {setX(v); setApplyInvKin(true)}} />
      <Input label="Y Position" value={y} setValue={(v) => {setY(v); setApplyInvKin(true)}} />
      <Input label="EE Angle" value={a} setValue={(v) => {setA(v); setApplyInvKin(true)}} />
    </div>
  </>
}