import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })

const OControls = () => {

  const controls = useRef<OrbitControls>(null!);
  const { camera, gl } = useThree();
  useFrame(() => controls.current.update());
  //@ts-ignore
  return <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.2} rotateSpeed={1} />

}

export default OControls;