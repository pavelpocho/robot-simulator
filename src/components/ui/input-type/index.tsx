import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
import { useJacobianCodeContext } from "../../../utils/contexts/JacobianCodeContext";

export enum InputType {
  FwdKin = 0,
  InvKin = 1,
  JointVel = 2,
  CartVel = 3,
  Trajectory = 4,
  Torques = 5
}

export const InputTypeUI = () => {
  const c = useInputTypeContext();
  const names = [ "Forward kinematics", "Inverse kinematics", "Joint velocities", "Cartesian velocities", "Trajectory generation", "Dynamic simulation" ];
  const inputTypes = [ InputType.FwdKin, InputType.InvKin, InputType.JointVel, InputType.CartVel, InputType.Trajectory, InputType.Torques ];

  const { jacobianCode } = useJacobianCodeContext();

  return <div>
    <div style={{
      overflowX: 'auto',
      width: '100%',
      display: 'flex',
      flexWrap: 'nowrap'
    }} >
      { inputTypes.map((t, i) => {
        return <button disabled={(t === InputType.JointVel || t === InputType.CartVel) && jacobianCode == null} style={{ whiteSpace: 'nowrap' }} className={ t === c?.inputType ? 'selected' : '' } key={i} onClick={() => {c?.setInputType(t)}}> 
          {names[i]}
        </button>
      }) }
    </div>
  </div>
}