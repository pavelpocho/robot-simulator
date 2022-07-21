import { Input } from "../input";

type n = React.Dispatch<React.SetStateAction<number>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  angle1DotDot: number, setAngle1DotDot: n,
  angle2DotDot: number, setAngle2DotDot: n,
  angle3DotDot: number, setAngle3DotDot: n,
  torque1: number, setTorque1: n,
  torque2: number, setTorque2: n,
  torque3: number, setTorque3: n,
  setApplyAccelerations: b, setApplyTorques: b
}

export const AccelerationControlUI: React.FC<Props> = ({
  angle1DotDot, angle2DotDot, angle3DotDot, setAngle1DotDot, setAngle2DotDot, setAngle3DotDot,
  torque1, torque2, torque3, setTorque1, setTorque2, setTorque3, setApplyAccelerations, setApplyTorques
}) => {
  return <>
    <div style={{ display: 'flex' }}>
      <Input label={'Joint 1 Acc'} value={angle1DotDot} setValue={setAngle1DotDot} />
      <Input label={'Joint 2 Acc'} value={angle2DotDot} setValue={setAngle2DotDot} />
      <Input label={'Joint 3 Acc'} value={angle3DotDot} setValue={setAngle3DotDot} />
    </div>
    <div style={{ display: 'flex' }}>
      <Input label={'Joint 1 Torque'} value={torque1} setValue={(v) => {setTorque1(v); setApplyTorques(true)}} />
      <Input label={'Joint 2 Torque'} value={torque2} setValue={(v) => {setTorque2(v); setApplyTorques(true)}} />
      <Input label={'Joint 3 Torque'} value={torque3} setValue={(v) => {setTorque3(v); setApplyTorques(true)}} />
    </div>
  </>
}