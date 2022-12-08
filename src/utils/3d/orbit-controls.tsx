import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })

interface Props {
  transformMatrices: (math.Matrix | null)[]
}

const OControls = ({ transformMatrices }: Props) => {

  const controls = useRef<OrbitControls>(null!);
  const { camera, gl } = useThree();
  camera.up.set( 0, 0, 1 );

  useFrame(() => {
    controls.current.update();
    const positions = transformMatrices.map(tm => [...Array(3).keys()].map(i => (tm?.toArray()[i] as number[])[3]));
    const maxPositions = [...Array(3).keys()].map(i => Math.max(...positions.map(p => p[i])));
    const minPositions = [...Array(3).keys()].map(i => Math.min(...positions.map(p => p[i])));
    controls.current.target = new Vector3(...([...Array(3).keys()].map(i => (maxPositions[i] + minPositions[i]) / 2)));
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.2} rotateSpeed={1} />

}

export default OControls;