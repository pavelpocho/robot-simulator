import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { Input } from "../input";
import { InputType } from "../input-type";

export const VelocityControlUI = () => {
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
    { (c?.inputType ?? 0) >= 2 && <div style={{ display: 'flex' }}>
      { robot?.jointVelocities.map((jvx, i) => (
        <Input 
          key={i}
          step={0.1}
          disabled={c.inputType != InputType.JointVel}
          label={`Joint ${i+1} Velocity`}
          value={jvx}
          setValue={(v: number) => {
            setRobot(r => ({ ...r, jointVelocities: r.jointVelocities.map((jV, j) => j === i ? v : jV) }));
          }}
        />
      )) }
    </div> }
    { (c?.inputType ?? 0) >= 2 && <div style={{ display: 'flex' }}>
      { robot.cartesianEEVelocities.map((cvx, i) => (
        <Input 
          key={i}
          step={0.1}
          disabled={c.inputType != InputType.CartVel}
          label={cartLabels[i]}
          value={cvx}
          setValue={(v: number) => {
            setRobot(r => ({ ...r, cartesianEEVelocities: r.cartesianEEVelocities.map((cV, j) => j === i ? v : cV) }));
          }}
        />
      ))}
    </div> }
  </>
}