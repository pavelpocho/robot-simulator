import { Canvas } from "@react-three/fiber";
import React from "react";
import TwoDRobot from "../../robotics/dh-translator";
import OControls from "../../utils/3d/orbit-controls";
import ThreeDBase from "../robot/3d-base/3d-base";
import ThreeDJoint from "../robot/3d-joint/3d-joint";

interface Props {
  robot: TwoDRobot | null
}

const ThreeDCanvas = ({ robot }: Props) => {
  const tm = robot?.forwardKinematics(0);
  const tm2 = robot?.forwardKinematics(1);
  const tm3 = robot?.forwardKinematics(2);
  return (
    <Canvas>
      {/* <ambientLight /> */}
      <pointLight position={[7, 5, 5]} />
      <pointLight position={[-7, -5, -5]} />
      <ThreeDBase />
      <ThreeDJoint transformMatrix={tm} />
      <ThreeDJoint transformMatrix={tm2} />
      <ThreeDJoint transformMatrix={tm3} />
      <OControls />
    </Canvas>
  )
}

export default ThreeDCanvas;