import React, { useContext } from "react"
import { Context } from "../../../utils/inputTypeContext";

export enum InputType {
  FwdKin = 0,
  InvKin = 1,
  JointVel = 2,
  CartVel = 3,
  Accel = 4,
  Torque = 5
}

interface Props {

}

export const InputTypeUI: React.FC<Props> = ({}) => {
  const c = useContext(Context);
  const inputTypes = [ InputType.FwdKin, InputType.InvKin, InputType.JointVel, InputType.CartVel, InputType.Accel, InputType.Torque ];
  return <div>
    { inputTypes.map((t, i) => {
      return <button key={i} onClick={() => {c?.setInputType(t)}}> 
        {t.toString()}
      </button>
    }) }
  </div>
}