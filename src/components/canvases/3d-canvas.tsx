import { Canvas } from "@react-three/fiber";
import OControls from "../../utils/3d/orbit-controls";
import { useNumbericTMsFrom0ToN } from "../../utils/hooks/robotHooks";
import ThreeDBase from "../robot/3d-base/3d-base";
import ThreeDEndEffector from "../robot/3d-end-effector/3d-end-effector";
import ThreeDJoint from "../robot/3d-joint/3d-joint";


const ThreeDCanvas = () => {

  const transformMatrices = useNumbericTMsFrom0ToN();

  return (
    <Canvas>
      {/* <ambientLight /> */}
      <pointLight position={[7, 5, 5]} />
      <pointLight position={[-7, -5, -5]} />
      <ThreeDBase />
      { transformMatrices.map((tm, i) => (
        i === transformMatrices.length - 1 ? (
          <ThreeDEndEffector key={i} transformMatrix={tm} />
        ) : (
          <ThreeDJoint key={i} transformMatrix={tm} />
        )
      )) }
      <OControls />
    </Canvas>
  )
}

export default ThreeDCanvas;