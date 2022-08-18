import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { Input } from "../input";
import { InputType } from "../input-type";

interface Props {}

export const VelocityControlUI: React.FC<Props> = ({}) => {
  const c = useInputTypeContext();
  const { robot, setRobot } = useRobotContext();

  const cartLabels = [
    'X Velocity',
    'Y Velocity',
    'Z Velocity',
    'X Angle Vel',
    'Y Angle Vel',
    'Z Angle Vel'
  ];

  return <>
    { c.inputType >= 2 && <div style={{ display: 'flex' }}>
      { robot?.jointVelocities.map((jvx, i) => (
        <Input 
          key={i}
          disabled={c.inputType != InputType.JointVel}
          label={`Joint ${i+1} Velocity`}
          value={jvx}
          setValue={(v: number) => {
            setRobot(r => { if (r) r.jointVelocities[i] = v; return r });
          }}
        />
      )) }
    </div> }
    { c.inputType >= 2 && <div style={{ display: 'flex' }}>
      { robot?.cartesianEEVelocities.map((cvx, i) => (
        <Input 
          key={i}
          disabled={c.inputType != InputType.InvKin}
          label={cartLabels[i]}
          value={cvx}
          setValue={(v: number) => {
            setRobot(r => { if (r) r.cartesianEEVelocities[i] = v; return r });
          }}
        />
      ))}
    </div> }
  </>
}