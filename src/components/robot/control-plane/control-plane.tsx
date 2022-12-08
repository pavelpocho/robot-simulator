import * as THREE from 'three';
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber';

const ControlPlane = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const geometry = useRef<THREE.PlaneGeometry>(null!);

  useFrame((state, delta) => {
    mesh.current.matrixAutoUpdate = false;
    // mesh.current.matrix.set();
  });
  return (<>
    <mesh ref={mesh}>
      <planeGeometry ref={geometry} args={[10, 10]} />
      <meshBasicMaterial color={'#F1F1F1'} transparent={true} opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  </>)
}

export default ControlPlane;