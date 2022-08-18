import { DHParametersUI } from "../ui/dh-parameters";
import { InputTypeUI } from "../ui/input-type";
import { PositionControlUI } from "../ui/position-control";
import { RobotTypeUI } from "../ui/robot-type";
import { ForwardKinematicsSimulationDetails } from "../ui/simulation-details/forward-kinematics";
import { VelocityControlUI } from "../ui/velocity-control";

export const UIWrapper = () => {
  return <div id={'control-wrapper'}>

    <h1 id='main-title'>2D Robotic Manipulator simulator</h1>

    <h3 className='section-title'>1. Choose input / simulation type</h3>
    <InputTypeUI />

    <h3 className='section-title'>2. Choose robot type</h3>
    <RobotTypeUI />
    <DHParametersUI />
    
    <h3 className='section-title'>3. Choose simulation parameters</h3>
    <h4>Kinematics</h4>
    <PositionControlUI />
    <VelocityControlUI />
    {/* { c.inputType == InputType.Torques && <>
      <h4>Dynamics</h4>
      <AccelerationControlUI {...kinematicsInfo} />
    </> }
    { c.inputType == InputType.Trajectory && <>
      <h4>Trajectory planning</h4>
      <TrajectoryControlUI {...kinematicsInfo} />
    </> }
    {/*
      #1: Cubic / quintic functions
      #2: Spliced linear with blends
    */}

    <h3 className='section-title'>4. See the simulation details</h3>
    <ForwardKinematicsSimulationDetails />
  </div>
}


/// Jacobian test code

/* <button onClick={() => {
  const compiledCode = robot?.getCompiledJacobian(robotType);

  console.log(kinematicsInfo.jointPositions);
  console.log(robot?.getJacobian(kinematicsInfo.jointPositions.map(k => k / 180 * Math.PI), [0, 2, 2, 2]));
  console.log(robot?.evaluateCompiledJacobian(compiledCode));

}}>Jacobian to compile</button> */