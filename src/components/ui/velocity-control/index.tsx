import { useInputTypeContext } from "../../../utils/inputTypeContext";
import { Input } from "../input";
import { InputType } from "../input-type";

type n = React.Dispatch<React.SetStateAction<number>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  angle1Dot: number, setAngle1Dot: n,
  angle2Dot: number, setAngle2Dot: n,
  angle3Dot: number, setAngle3Dot: n,
  yDot: number, setYDot: n,
  aDot: number, setADot: n,
  xDot: number, setXDot: n,
  setApplyJointVelocities: b, setApplyCartesianVelocities: b
}

export const VelocityControlUI: React.FC<Props> = ({
  angle1Dot, angle2Dot, angle3Dot, setAngle1Dot, setAngle2Dot, setAngle3Dot,
  xDot, yDot, aDot, setXDot, setYDot, setADot, setApplyJointVelocities, setApplyCartesianVelocities
}) => {
  const c = useInputTypeContext();
  return <>
    { c.inputType >= 2 && <div style={{ display: 'flex' }}>
      <Input disabled={c.inputType != InputType.JointVel} label={'Joint 1 Vel'} value={angle1Dot} setValue={setAngle1Dot} />
      <Input disabled={c.inputType != InputType.JointVel} label={'Joint 2 Vel'} value={angle2Dot} setValue={setAngle2Dot} />
      <Input disabled={c.inputType != InputType.JointVel} label={'Joint 3 Vel'} value={angle3Dot} setValue={setAngle3Dot} />
    </div> }
    { c.inputType >= 2 && <div style={{ display: 'flex' }}>
      <Input disabled={c.inputType != InputType.CartVel} label={'X 1 Vel'} value={xDot} setValue={(v: number) => {setXDot(v); setApplyCartesianVelocities(true)}} />
      <Input disabled={c.inputType != InputType.CartVel} label={'Y 1 Vel'} value={yDot} setValue={(v: number) => {setYDot(v); setApplyCartesianVelocities(true)}} />
      <Input disabled={c.inputType != InputType.CartVel} label={'A 1 Vel'} value={aDot} setValue={(v: number) => {setADot(v); setApplyCartesianVelocities(true)}} />
    </div> }
  </>
}