import { Button, Space, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { useMemo } from "react";
import { useInputTypeContext } from "../../utils/contexts/InputTypeContext";
import { useRobotContext } from "../../utils/contexts/RobotContext";
import { DHParametersUI } from "../ui/dh-parameters";
import { InputType, InputTypeUI } from "../ui/input-type";
import { PlaneController } from "../ui/plane-controller";
import { RobotTypeUI } from "../ui/robot-type";
import { CartesianVelocitySimDeets } from "../ui/simulation-details/cartesian-velocity";
import { ForwardKinematicsSimulationDetails } from "../ui/simulation-details/forward-kinematics";
import { InverseKinematicsSimDeets } from "../ui/simulation-details/inverse-kinematics";
import { JointVelocitySimDeets } from "../ui/simulation-details/joint-velocity";
import { TorquesSimDeets } from "../ui/simulation-details/torqures";
import { TrajectorySimDeets } from "../ui/simulation-details/trajectory";
import { CartVelUI } from "../ui/uis/cart-vel-ui";
import { FwdKinUI } from "../ui/uis/fwd-kin-ui";
import { InvKinUI } from "../ui/uis/inv-kin-ui";
import { JointVelUI } from "../ui/uis/joint-vel-ui";
import { TorquesUI } from "../ui/uis/torques-ui";
import { TrajectoryUI } from "../ui/uis/trajectory-ui";

export const UIWrapper = ({ recalculateJacobian, jls }: { recalculateJacobian: () => void, jls: string } ) => {

  const { inputType, setInputType } = useInputTypeContext();
  const names = [ "Forward kinematics", "Inverse kinematics", "Joint velocities", "Cartesian velocities", "Trajectory generation", "Dynamic simulation" ];

  const JointVelocitySimDeetsMemo = useMemo(() => {
    return <JointVelocitySimDeets />
  }, [ inputType ]);

  return <div id={'control-wrapper'}>

    <Title align="center" order={2}>{
      inputType == null ? 'Serial Kinematic Manipulator Visualizer' : names[inputType]
    }</Title>

    {
      inputType == null && <>
        <div>
          {/* <Divider size='sm' my="md" variant="dashed" label={<Title order={6}>1. Choose Robot Type</Title>} labelPosition={'center'} /> */}
          <RobotTypeUI />
          <Space h='xl' />
          <DHParametersUI recalculateJacobian={recalculateJacobian} jls={jls} />
        </div>
        <div>
          {/* <Divider size='sm' my="md" variant="dashed" label={<Title order={6}>2. Choose Visualization</Title>} labelPosition={'center'} /> */}
          <InputTypeUI inputType={inputType} setInputType={setInputType} />
        </div>
      </>
    }

    {
      inputType != null && <>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => {
            setInputType(null);
          }} variant={'outline'} color={'gray'} leftIcon={<IconArrowLeft />}>Simulation Selection</Button>
        </div>
        
        <div>
          <Title order={4}>Choose Visualization Parameters</Title>
          <Space h={'sm'} />
          { inputType == InputType.FwdKin ? <FwdKinUI /> :
            inputType == InputType.InvKin ? <InvKinUI /> :
            inputType == InputType.JointVel ? <JointVelUI /> :
            inputType == InputType.CartVel ? <CartVelUI /> :
            inputType == InputType.Torques ? <TorquesUI /> :
            inputType == InputType.Trajectory ? <TrajectoryUI /> : null
          }
          <Space h='xl' />
        </div>

        <div>
          <Title order={4}>See Visualization Results</Title>
          <Space h={'sm'} />
          { inputType == InputType.FwdKin ? <ForwardKinematicsSimulationDetails /> :
            inputType == InputType.InvKin ? <InverseKinematicsSimDeets /> :
            inputType == InputType.JointVel ? JointVelocitySimDeetsMemo :
            inputType == InputType.CartVel ? <CartesianVelocitySimDeets /> :
            inputType == InputType.Torques ? <TorquesSimDeets /> :
            inputType == InputType.Trajectory ? <TrajectorySimDeets /> : null
          }
        </div>

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
      </>
    }

  </div>
}


/// Jacobian test code

/* <button onClick={() => {
  const compiledCode = robot?.getCompiledJacobian(robotType);

  console.log(kinematicsInfo.jointPositions);
  console.log(robot?.getJacobian(kinematicsInfo.jointPositions.map(k => k / 180 * Math.PI), [0, 2, 2, 2]));
  console.log(robot?.evaluateCompiledJacobian(compiledCode));

}}>Jacobian to compile</button> */