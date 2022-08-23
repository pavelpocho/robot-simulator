import { useAngleRepresentationContext } from "../../../utils/contexts/AngleRepresentationContext";
import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { Input } from "../input";
import { InputType } from "../input-type";

export enum AR {
  XYZFixed,
  ZYXEuler,
  ZYZEuler,
  EqAnAx,
  EulerParams
}

export const PositionControlUI = () => {

  const { angleRepresentation: ar, setAngleRepresentation: setAr } = useAngleRepresentationContext();
  const { inputType } = useInputTypeContext();
  const { robot, setRobot } = useRobotContext();

  const cartLabels = [
    'X Position',
    'Y Position',
    'Z Position',
    ar == AR.XYZFixed ? 'X Angle' : (ar == AR.ZYXEuler || ar == AR.ZYZEuler) ? 'Z Angle' : ar == AR.EqAnAx ? 'Angle' : 'e1',
    (ar == AR.XYZFixed || ar == AR.ZYXEuler || ar == AR.ZYZEuler) ? 'Y Angle' : ar == AR.EqAnAx ? 'Axis X Part' : 'e2',
    (ar == AR.XYZFixed || ar == AR.ZYZEuler) ? 'Z Angle' : ar == AR.ZYXEuler ? 'X Angle' : ar == AR.EulerParams ? 'e3' : 'Axis Y Part',
    ar == AR.EulerParams ? 'e4' : ar == AR.EqAnAx ? 'Axis Z Part' : ''
  ];

  return <>
    <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
      { robot?.jointPositions.map((jpx, i) => (
        <Input 
          key={i}
          step={robot.type[i] === 'P' ? 0.2 : 0.02}
          disabled={inputType != InputType.FwdKin}
          label={`Joint ${i+1} Position`}
          value={jpx}
          setValue={(v: number) => {
            setRobot(r => ({ ...r, jointPositions: r.jointPositions.map((jp, j) => j === i ? v : jp) }))
          }}
        />
      )) }
    </div>
    <p>Angle representation</p>
    <select value={ar} onChange={e => setAr(parseInt(e.currentTarget.value) as AR)}>
      <option value={AR.XYZFixed}>X-Y-Z Fixed</option>
      <option value={AR.ZYXEuler}>Z-Y-X Euler</option>
      <option value={AR.ZYZEuler}>Z-Y-Z Euler</option>
      <option value={AR.EqAnAx}>Equivalent Angle Axis</option>
      <option value={AR.EulerParams}>Euler Parameters</option>
    </select>
    <div style={{ display: 'flex' }}>
      { robot?.cartesianEEPositions.map((cpx, i) => cartLabels[i] !== '' && <Input 
        key={i}
        disabled={inputType != InputType.InvKin}
        label={cartLabels[i]}
        value={cpx}
        setValue={(v: number) => {
          setRobot(r => ({ ...r, cartesianEEPositions: r.cartesianEEPositions.map((cp, j) => j === i ? v : cp) }))
        }}
      />)}
    </div>
  </>
}