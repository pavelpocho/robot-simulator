import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { Input } from "../input";
import { InputType } from "../input-type";

export const PositionControlUI = () => {
  const c = useInputTypeContext();
  const { robot, setRobot } = useRobotContext();

  const cartLabels = [
    'X Position',
    'Y Position',
    'Z Position',
    'X Angle',
    'Y Angle',
    'Z Angle'
  ];

  return <>
    <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
      { robot?.jointPositions.map((jpx, i) => (
        <Input 
          key={i}
          step={robot.type[i] === 'P' ? 0.2 : 0.02}
          disabled={c.inputType != InputType.FwdKin}
          label={`Joint ${i+1} Position`}
          value={jpx}
          setValue={(v: number) => {
            setRobot(r => ({ ...r, jointPositions: r.jointPositions.map((jp, j) => j === i ? v : jp) }))
          }}
        />
      )) }
    </div>
    <div style={{ display: 'flex' }}>
      { robot?.cartesianEEPositions.map((cpx, i) => (
        <Input 
          key={i}
          disabled={c.inputType != InputType.InvKin}
          label={cartLabels[i]}
          value={cpx}
          setValue={(v: number) => {
            setRobot(r => ({ ...r, cartesianEEPositions: r.cartesianEEPositions.map((cp, j) => j === i ? v : cp) }))
          }}
        />
      ))}
    </div>
  </>
}