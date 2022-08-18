import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber';

const ThreeDEndEffector = (props: { position?: any, transformMatrix: math.Matrix | null | undefined } ) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const cyl = useRef<THREE.CylinderGeometry>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const tm = props.transformMatrix;

  const gI = (i: number, j: number) => tm ? (tm.toArray()[i] as number[])[j] : 0;

  useEffect(() => {
    if (cyl.current) {
      // cyl.current.translate(0, 0.5, 0);
      cyl.current.rotateX(Math.PI / 2);
    }
  }, [])

  useFrame((state, delta) => {
    mesh.current.matrixAutoUpdate = false;
    if (tm) {
      mesh.current.matrix.set(
        gI(0, 0), gI(0, 1), gI(0, 2), gI(0, 3),
        gI(1, 0), gI(1, 1), gI(1, 2), gI(1, 3), 
        gI(2, 0), gI(2, 1), gI(2, 2), gI(2, 3), 
        gI(3, 0), gI(3, 1), gI(3, 2), gI(3, 3)
      );
    }
  });
  return (
    <mesh
      {...props}
      ref={mesh}
      // scale={active ? 1.5 : 1}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <cylinderGeometry ref={cyl} args={[0.5, 0.5, 1, 10]}>
      </cylinderGeometry>
      <meshStandardMaterial color={hovered ? 'hotpink' : 'green'} />
    </mesh>
  )
}

export default ThreeDEndEffector;