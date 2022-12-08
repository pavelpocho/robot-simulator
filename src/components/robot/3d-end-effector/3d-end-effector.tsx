import * as THREE from 'three';
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { ObjectMap, useFrame } from '@react-three/fiber';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const ThreeDEndEffector = (props: { position?: any, statorRotor: GLTF & ObjectMap, transformMatrix: math.Matrix | null | undefined } ) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const cyl = useRef<THREE.CylinderGeometry>(null!);
  const traces: (MutableRefObject<THREE.Mesh>)[] = [];
  for (let i = 0; i < 100; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    traces.push(useRef<THREE.Mesh>(null!));
  }
  const EEMesh = props.statorRotor.nodes.EE;


  const [ hovered, setHover ] = useState(false);
  const [ active, setActive ] = useState(false);
  const [ currentTrace, setCurrentTrace ] = useState(0);
  const [ traceSpace, setTraceSpace ] = useState(0);
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
    if (traces[currentTrace].current) traces[currentTrace].current.matrixAutoUpdate = false;
    if (tm) {
      mesh.current.matrix.set(
        gI(0, 0), gI(0, 1), gI(0, 2), gI(0, 3),
        gI(1, 0), gI(1, 1), gI(1, 2), gI(1, 3), 
        gI(2, 0), gI(2, 1), gI(2, 2), gI(2, 3), 
        gI(3, 0), gI(3, 1), gI(3, 2), gI(3, 3)
      );
      if (traces[currentTrace].current) traces[currentTrace].current.matrix.set(
        gI(0, 0), gI(0, 1), gI(0, 2), gI(0, 3),
        gI(1, 0), gI(1, 1), gI(1, 2), gI(1, 3), 
        gI(2, 0), gI(2, 1), gI(2, 2), gI(2, 3), 
        gI(3, 0), gI(3, 1), gI(3, 2), gI(3, 3)
      )
    }
    if (traceSpace > 30) {
      setCurrentTrace(ct => ct >= 99 ? 0 : (ct + 1));
      setTraceSpace(0);
    }
    else {
      setTraceSpace(t => t + 1);
    }
  });
  return (<>
    <mesh
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      geometry={EEMesh.geometry}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      material={EEMesh.material}
      ref={mesh}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    ></mesh>
    {/* <mesh
      {...props}
      ref={mesh}
      // scale={active ? 1.5 : 1}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <cylinderGeometry ref={cyl} args={[0.2, 0.2, 1, 10]}>
      </cylinderGeometry>
      <meshStandardMaterial color={hovered ? 'hotpink' : 'green'} />
    </mesh> */}
    {[...Array(100).keys()].map(i => (
      <mesh
        {...props}
        key={i}
        ref={traces[i]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 10]} />
        <meshStandardMaterial color={'hotpink'} />
      </mesh>
    ))}
  </>)
}

export default ThreeDEndEffector;