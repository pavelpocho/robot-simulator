import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react'
import { ObjectMap, useFrame, useLoader } from '@react-three/fiber';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRotorStatorContext } from '../../../utils/contexts/RotorStatorContext';
import { Object3D } from 'three';
import math, { cos, matrix, multiply, sin, sqrt, sum } from 'mathjs';
import { LinkParameter } from '../../../utils/contexts/RobotContext';

const ThreeDJoint = (props: { jointTypeForJ: 'P' | 'R', jointType: 'P' | 'R', linkTM: math.Matrix | null | undefined, dhTable: LinkParameter[], dhRowIndex: number, prevTM: math.Matrix | null | undefined, statorRotor: GLTF & ObjectMap, stator: GLTF & ObjectMap, position?: any, transformMatrix: math.Matrix | null | undefined } ) => {
  const statorRef = useRef<THREE.Mesh>(null!);
  const rotorRef = useRef<THREE.Mesh>(null!);
  const linkPart = useRef<THREE.Mesh>(null!);
  const cyl = useRef<THREE.BufferGeometry>(null!);
  const cube = useRef<THREE.BufferGeometry>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const tm = props.transformMatrix;
  const prevTM = props.prevTM;
  const dh = props.dhTable[props.dhRowIndex];
  const dhL = props.dhTable[props.dhRowIndex + 1];
  const statorMesh = props.statorRotor.nodes.Stator;
  const prismaticMesh = props.statorRotor.nodes.Prism;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const prismMaterial = props.statorRotor.nodes.Corner.material;
  const rotor = props.statorRotor.nodes.Rotor;

  const difPositions = [...Array(3).keys()].map(i => (props.linkTM?.toArray()[i] as number[])[3]).concat([1]);

  // const gI = (i: number, j: number) => tm ? (tm.toArray()[i] as number[])[j] : 0;
  // const gIg = (i: number, j: number, m: math.Matrix) => m ? (m.toArray()[i] as number[])[j] : 0;
  // const getM = (m: math.Matrix) => prevTM ? multiply(prevTM, m) : null;

  useFrame((state, delta) => {
    statorRef.current.matrixAutoUpdate = false;
    if (rotorRef.current) rotorRef.current.matrixAutoUpdate = false;
    if (tm) {
      const meshZRotate = matrix([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, dh.d_i > 0 ? -1 : 1, 0],
        [0, 0, 0, 1]
      ]);
      const gI = (i: number, j: number) => tm ? (multiply(tm, meshZRotate).toArray()[i] as number[])[j] : 0;
      if (rotorRef.current) {
        rotorRef.current.matrix.set(
          gI(0, 0), gI(0, 1), gI(0, 2), gI(0, 3),
          gI(1, 0), gI(1, 1), gI(1, 2), gI(1, 3), 
          gI(2, 0), gI(2, 1), gI(2, 2), gI(2, 3), 
          gI(3, 0), gI(3, 1), gI(3, 2), gI(3, 3)
        );
      }
      const meshZMatrix = matrix([
        [1, 0, 0, dh.a_i_minus_1], 
        [0, cos(dh.alpha_i_minus_1), -sin(dh.alpha_i_minus_1), -sin(dh.alpha_i_minus_1) * dh.d_i], 
        [0, sin(dh.alpha_i_minus_1), cos(dh.alpha_i_minus_1), cos(dh.alpha_i_minus_1) * dh.d_i],
        [0, 0, 0, 1]
      ]);
      if (!prevTM) return;
      // const cM = multiply(prevTM, meshZMatrix);
      // const cM = multiply(multiply(prevTM, meshZMatrix), meshZRotate);
      const cM = multiply(multiply(prevTM, meshZMatrix), meshZRotate);
      statorRef.current.matrix.set(
        (cM.toArray()[0] as number[])[0], (cM.toArray()[0] as number[])[1], (cM.toArray()[0] as number[])[2], (cM.toArray()[0] as number[])[3],
        (cM.toArray()[1] as number[])[0], (cM.toArray()[1] as number[])[1], (cM.toArray()[1] as number[])[2], (cM.toArray()[1] as number[])[3],
        (cM.toArray()[2] as number[])[0], (cM.toArray()[2] as number[])[1], (cM.toArray()[2] as number[])[2], (cM.toArray()[2] as number[])[3],
        (cM.toArray()[3] as number[])[0], (cM.toArray()[3] as number[])[1], (cM.toArray()[3] as number[])[2], (cM.toArray()[3] as number[])[3]
      )
    }
    if (props.transformMatrix && linkPart.current) {
      linkPart.current.matrixAutoUpdate = false;
      const meshZMatrix = matrix([
        [1, 0, 0, dhL.a_i_minus_1], 
        [0, cos(dhL.alpha_i_minus_1), -sin(dhL.alpha_i_minus_1), -sin(dhL.alpha_i_minus_1) * (dhL.d_i - 2.5 * 0.2 * (dhL.d_i < 0 ? -1 : 1)) / 2], 
        [0, sin(dhL.alpha_i_minus_1), cos(dhL.alpha_i_minus_1), cos(dhL.alpha_i_minus_1) * (dhL.d_i - 2.5 * 0.2 * (dhL.d_i < 0 ? -1 : 1)) / 2],
        [0, 0, 0, 1]
      ]);
      const meshZRotate = matrix([
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1]
      ]);
      const cM = multiply(multiply(props.transformMatrix, meshZMatrix), meshZRotate);
      linkPart.current.matrix.set(
        (cM.toArray()[0] as number[])[0], (cM.toArray()[0] as number[])[1], (cM.toArray()[0] as number[])[2], (cM.toArray()[0] as number[])[3],
        (cM.toArray()[1] as number[])[0], (cM.toArray()[1] as number[])[1], (cM.toArray()[1] as number[])[2], (cM.toArray()[1] as number[])[3],
        (cM.toArray()[2] as number[])[0], (cM.toArray()[2] as number[])[1], (cM.toArray()[2] as number[])[2], (cM.toArray()[2] as number[])[3],
        (cM.toArray()[3] as number[])[0], (cM.toArray()[3] as number[])[1], (cM.toArray()[3] as number[])[2], (cM.toArray()[3] as number[])[3]
      )
    }
  });

  
  return (<>
    <mesh
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      geometry={props.jointTypeForJ === 'P' ? prismaticMesh.geometry : statorMesh.geometry}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      material={props.jointTypeForJ === 'P' ? prismaticMesh.material : statorMesh.material}
      ref={statorRef}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
    </mesh>
    { props.jointTypeForJ === 'R' && <mesh
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      geometry={rotor.geometry}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      material={rotor.material}
      ref={rotorRef}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
    </mesh> }
    { props.jointType === 'P' && sqrt(sum(difPositions?.[2] ** 2, difPositions?.[1] ** 2)) > 2.5 * 0.2 && <mesh
      {...props}
      ref={linkPart}
      // scale={active ? 1.5 : 1}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
      material={prismMaterial}
    >
      <cylinderBufferGeometry args={[0.2, 0.2, ((sqrt(sum(difPositions?.[2] ** 2, difPositions?.[1] ** 2)) - 2.5 * 0.2)) ?? 0, 16]} />
    </mesh> }
  </>)
}

export default ThreeDJoint;