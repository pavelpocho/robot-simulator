import { Canvas } from "@react-three/fiber";
import math, { identity } from "mathjs";
import OControls from "../../utils/3d/orbit-controls";
import { useRobotContext } from "../../utils/contexts/RobotContext";
import { useRotorStatorContext } from "../../utils/contexts/RotorStatorContext";
import { useNumbericTMsFrom0ToN, useNumbericTMsFromNMin1ToN } from "../../utils/hooks/robotHooks";
import ThreeDBase from "../robot/3d-base/3d-base";
import ThreeDEndEffector from "../robot/3d-end-effector/3d-end-effector";
import ThreeDJoint from "../robot/3d-joint/3d-joint";
import ThreeDLink from "../robot/3d-link/3d-link";
import ControlPlane from "../robot/control-plane/control-plane";


const ThreeDCanvas = () => {

  const transformMatrices = [(identity(4) as (math.Matrix | null))].concat(useNumbericTMsFrom0ToN());
  const linkTransformMatrices = useNumbericTMsFromNMin1ToN();
  const { robot } = useRobotContext();
  const { statorRotor, stator } = useRotorStatorContext();

  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[28, 20, 20]} intensity={0.3} />
      <pointLight position={[-28, -20, -20]} intensity={0.3} />
      <pointLight position={[-28, 20, 20]} intensity={0.3} />
      <pointLight position={[28, -20, -20]} intensity={0.3} />
      <pointLight position={[28, -20, 20]} intensity={0.3} />
      <pointLight position={[-28, 20, -20]} intensity={0.3} />
      <pointLight position={[28, 20, -20]} intensity={0.3} />
      <pointLight position={[-28, -20, 20]} intensity={0.3} />
      <ThreeDBase />
      {/* <ControlPlane /> */}
      { transformMatrices.map((tm, i) => (
        i === 0 ? null : 
        i === transformMatrices.length - 1 ? (
          <ThreeDEndEffector key={i} transformMatrix={tm} statorRotor={statorRotor} />
        ) : (
          <ThreeDJoint linkTM={linkTransformMatrices[i]} jointTypeForJ={robot.type[i - 1] === 'P' ? 'P' : 'R'} jointType={robot.type[i] === 'P' ? 'P' : 'R'} stator={stator} statorRotor={statorRotor} key={i} prevTM={transformMatrices[i - 1]} transformMatrix={tm} dhTable={robot.dhTable} dhRowIndex={i-1} />
        )
      )) }
      { transformMatrices.map((tm, i) => (
        i !== transformMatrices.length - 1 ? <ThreeDLink nextJointType={robot.type[i] === 'P' ? 'P' : 'R'} statorRotor={statorRotor} key={i} linkTM={linkTransformMatrices[i]} dhTable={robot.dhTable} dhRowIndex={i} baseTM={tm} targetTM={transformMatrices[i+1]} /> : null
      )) }
      <OControls transformMatrices={transformMatrices} />
    </Canvas>
  )
}

export default ThreeDCanvas;