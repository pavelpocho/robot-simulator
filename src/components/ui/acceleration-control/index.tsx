export {}
// import React from "react";
// import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
// import { useRobotContext } from "../../../utils/contexts/RobotContext";
// import { JointFriction } from "../../../utils/hooks/useKinematicInfo";
// import { Input } from "../input";
// import { InputType } from "../input-type";

// type n = React.Dispatch<React.SetStateAction<number[]>>;
// type b = React.Dispatch<React.SetStateAction<boolean>>;

// interface Props {
//   torques: number[]
//   setTorques: n
//   linkMasses: number[],
//   setLinkMasses: n,
//   linkWidths: number[],
//   setLinkWidths: n,
//   jointFrictions: JointFriction[],
//   setJointFrictions: React.Dispatch<React.SetStateAction<JointFriction[]>>,
//   gravity: number,
//   setGravity: React.Dispatch<React.SetStateAction<number>>,
//   eeForces: number[],
//   setEeForces: n,
//   positionsToHold: number[],
//   setPositionsToHold: n
// }

// export const AccelerationControlUI: React.FC<Props> = ({
//   torques, setTorques, linkMasses, setLinkMasses, linkWidths, setLinkWidths, jointFrictions, setJointFrictions,
//   gravity, setGravity, eeForces, setEeForces, positionsToHold, setPositionsToHold
// }) => {
//   const c = useInputTypeContext();
//   return <>
//     {/* <div style={{ display: 'flex' }}>
//       <Input label={'Joint 1 Vel'} value={angle1Dot} setValue={setAngle1Dot} />
//       <Input label={'Joint 2 Vel'} value={angle2Dot} setValue={setAngle2Dot} />
//       <Input label={'Joint 3 Vel'} value={angle3Dot} setValue={setAngle3Dot} />
//     </div> */}
//     <h6>Dynamic simulation parameters</h6>
//     <p style={{ marginBottom: 0 }}>Link masses (uniform distribution among rectangle)</p>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label="Link mass 1" value={linkMasses[0]} setValue={(v: number) => { setLinkMasses(t => { t[0] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link mass 2" value={linkMasses[1]} setValue={(v: number) => { setLinkMasses(t => { t[1] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link mass 3" value={linkMasses[2]} setValue={(v: number) => { setLinkMasses(t => { t[2] = v; return t }) }} />
//     </div>
//     <p style={{ marginBottom: 0 }}>Link widths</p>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label="Link width 1" value={linkWidths[0]} setValue={(v: number) => { setLinkWidths(t => { t[0] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link width 2" value={linkWidths[1]} setValue={(v: number) => { setLinkWidths(t => { t[1] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link width 3" value={linkWidths[2]} setValue={(v: number) => { setLinkWidths(t => { t[2] = v; return t }) }} />
//     </div>
//     <p style={{ marginBottom: 0 }}>Static friction coefficients of joints</p>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label="Link 1" value={jointFrictions[0].staticFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[0].staticFriction = v; return fs }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link 2" value={jointFrictions[1].staticFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[1].staticFriction = v; return fs }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link 3" value={jointFrictions[2].staticFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[2].staticFriction = v; return fs }) }} />
//     </div>
//     <p style={{ marginBottom: 0 }}>Dynamic friction coefficients of joints</p>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label="Link 1" value={jointFrictions[0].dynamicFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[0].dynamicFriction = v; return fs }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link 2" value={jointFrictions[1].dynamicFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[1].dynamicFriction = v; return fs }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link 3" value={jointFrictions[2].dynamicFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[2].dynamicFriction = v; return fs }) }} />
//     </div>
//     <p style={{ marginBottom: 0 }}>Viscous friction coefficients of joints</p>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label="Link 1" value={jointFrictions[0].viscousFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[0].viscousFriction = v; return fs }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link 2" value={jointFrictions[1].viscousFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[1].viscousFriction = v; return fs }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label="Link 3" value={jointFrictions[2].viscousFriction} setValue={(v: number) => { setJointFrictions(fs => { fs[2].viscousFriction = v; return fs }) }} />
//     </div>
//     <Input disabled={c.inputType != InputType.Torques} label="Gravity" value={gravity} setValue={(v: number) => { setGravity(v) }} />
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label={'EE Force X'} value={eeForces[0]} setValue={(v: number) => { setEeForces(t => { t[0] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label={'EE Force Y'} value={eeForces[1]} setValue={(v: number) => { setEeForces(t => { t[1] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label={'EE Torque Z'} value={eeForces[2]} setValue={(v: number) => { setEeForces(t => { t[2] = v; return t }) }} />
//     </div>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label={'Torque 1'} value={torques[0]} setValue={(v: number) => { setTorques(t => { t[0] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label={'Torque 2'} value={torques[1]} setValue={(v: number) => { setTorques(t => { t[1] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label={'Torque 3'} value={torques[2]} setValue={(v: number) => { setTorques(t => { t[2] = v; return t }) }} />
//     </div>
//     <div style={{ display: 'flex' }}>
//       <Input disabled={c.inputType != InputType.Torques} label={'Postohold 1'} value={positionsToHold[0]} setValue={(v: number) => { setPositionsToHold(t => { t[0] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label={'Postohold 2'} value={positionsToHold[1]} setValue={(v: number) => { setPositionsToHold(t => { t[1] = v; return t }) }} />
//       <Input disabled={c.inputType != InputType.Torques} label={'Postohold 3'} value={positionsToHold[2]} setValue={(v: number) => { setPositionsToHold(t => { t[2] = v; return t }) }} />
//     </div>
//   </>
// }