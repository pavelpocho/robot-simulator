import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react'
import { ObjectMap, ThreeElements, useFrame, useLoader } from '@react-three/fiber';
import math, { abs, cos, matrix, max, multiply, sin, sqrt, sum } from 'mathjs';
import { LinkParameter, useRobotContext } from '../../../utils/contexts/RobotContext';
import vector from '../../../utils/vector';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRotorStatorContext } from '../../../utils/contexts/RotorStatorContext';
import { Object3D, Vector3 } from 'three';

const ThreeDLink = (props: { statorRotor: GLTF & ObjectMap, dhTable: LinkParameter[], dhRowIndex: number, baseTM: math.Matrix | null | undefined, targetTM: math.Matrix | null | undefined, linkTM: math.Matrix | null | undefined, nextJointType: 'P' | 'R' } ) => {
  const meshX = useRef<THREE.Mesh>(null!);
  const cornerRef = useRef<THREE.Mesh>(null!);
  const meshZ = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const baseTM = props.baseTM;
  const targetTM = props.targetTM;
  const linkTM  = props.linkTM;
  const dhPrev = props.dhRowIndex >= 1 ? props.dhTable[props.dhRowIndex - 1] : { theta_i: 0 };
  const dh = props.dhTable[props.dhRowIndex];
  const dhNext = props.dhTable[props.dhRowIndex + 1];
  const corner = props.statorRotor.nodes.Corner;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const linkMaterial = props.statorRotor.nodes.Link.material;

  const gIB = (i: number, j: number) => baseTM ? (baseTM.toArray()[i] as number[])[j] : 0;
  const gIT = (i: number, j: number) => targetTM ? (targetTM.toArray()[i] as number[])[j] : 0;

  const difPositions = [...Array(3).keys()].map(i => (linkTM?.toArray()[i] as number[])[3]).concat([1]);
  const yzCombined = sqrt(sum(difPositions?.[2] ** 2, difPositions?.[1] ** 2));

  useFrame((state, delta) => {
    if (meshX.current) meshX.current.matrixAutoUpdate = false;
    if (cornerRef.current) cornerRef.current.matrixAutoUpdate = false;
    if (meshZ.current) meshZ.current.matrixAutoUpdate = false;
    if (difPositions != null) {
      const avgPosition = [ ...Array(3).keys() ].map(i => (gIB(i, 3) + difPositions[i] / 2));
      if (baseTM && meshX.current) { 
        // Thinking of this as another joint, it is offset by a / 2, alpha and theta, but not d
        const meshXMatrix = matrix([
          [1, 0, 0, dh.a_i_minus_1 / 2 + (yzCombined < 2.7 * 0.2 ? (dh.a_i_minus_1 < 0 ? 0.1 : -0.1) : 0)], 
          [0, cos(dh.alpha_i_minus_1), -sin(dh.alpha_i_minus_1), 0], 
          [0, sin(dh.alpha_i_minus_1), cos(dh.alpha_i_minus_1), 0],
          [0, 0, 0, 1]
        ]);
        const meshXRotate = matrix([
          [0, 1, 0, 0],
          [1, 0, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1]
        ]);
        const cM = multiply(multiply(baseTM, meshXMatrix), meshXRotate);
        meshX.current.matrix.set(
          (cM.toArray()[0] as number[])[0], (cM.toArray()[0] as number[])[1], (cM.toArray()[0] as number[])[2], (cM.toArray()[0] as number[])[3],
          (cM.toArray()[1] as number[])[0], (cM.toArray()[1] as number[])[1], (cM.toArray()[1] as number[])[2], (cM.toArray()[1] as number[])[3],
          (cM.toArray()[2] as number[])[0], (cM.toArray()[2] as number[])[1], (cM.toArray()[2] as number[])[2], (cM.toArray()[2] as number[])[3],
          (cM.toArray()[3] as number[])[0], (cM.toArray()[3] as number[])[1], (cM.toArray()[3] as number[])[2], (cM.toArray()[3] as number[])[3],
        )
      }
      if (baseTM && meshZ.current) {
        const meshZMatrix = matrix([
          [1, 0, 0, dh.a_i_minus_1], 
          [0, cos(dh.alpha_i_minus_1), -sin(dh.alpha_i_minus_1), -sin(dh.alpha_i_minus_1) * (dh.d_i - 2.5 * 0.2 * (dh.d_i < 0 ? -1 : 1)) / 2], 
          [0, sin(dh.alpha_i_minus_1), cos(dh.alpha_i_minus_1), cos(dh.alpha_i_minus_1) * (dh.d_i - 2.5 * 0.2 * (dh.d_i < 0 ? -1 : 1)) / 2],
          [0, 0, 0, 1]
        ]);
        const meshZRotate = matrix([
          [1, 0, 0, 0],
          [0, 0, 1, 0],
          [0, 1, 0, 0],
          [0, 0, 0, 1]
        ]);
        const cM = multiply(multiply(baseTM, meshZMatrix), meshZRotate);
        meshZ.current.matrix.set(
          (cM.toArray()[0] as number[])[0], (cM.toArray()[0] as number[])[1], (cM.toArray()[0] as number[])[2], (cM.toArray()[0] as number[])[3],
          (cM.toArray()[1] as number[])[0], (cM.toArray()[1] as number[])[1], (cM.toArray()[1] as number[])[2], (cM.toArray()[1] as number[])[3],
          (cM.toArray()[2] as number[])[0], (cM.toArray()[2] as number[])[1], (cM.toArray()[2] as number[])[2], (cM.toArray()[2] as number[])[3],
          (cM.toArray()[3] as number[])[0], (cM.toArray()[3] as number[])[1], (cM.toArray()[3] as number[])[2], (cM.toArray()[3] as number[])[3]
        )
      }
      if (baseTM && cornerRef.current) { 
        // Thinking of this as another joint, it is offset by a / 2, alpha and theta, but not d
        const meshXMatrix = matrix([
          [1, 0, 0, dh.a_i_minus_1 + (yzCombined < 2.7 * 0.2 ? (dh.a_i_minus_1 < 0 ? 0.1 : -0.1) : 0)], 
          [0, cos(dh.alpha_i_minus_1), -sin(dh.alpha_i_minus_1), 0], 
          [0, sin(dh.alpha_i_minus_1), cos(dh.alpha_i_minus_1), 0],
          [0, 0, 0, 1]
        ]);
        const cornerRotate = matrix([
          [dh.d_i > 0 ? 1 : 0, 0, dh.d_i > 0 ? 0 : -1, 0],
          [0, 1, 0, 0],
          [dh.d_i > 0 ? 0 : 1, 0, dh.d_i > 0 ? 1 : 0, 0],
          [0, 0, 0, 1]
        ]);
        const cM = multiply(multiply(baseTM, meshXMatrix), cornerRotate);
        cornerRef.current.matrix.set(
          (cM.toArray()[0] as number[])[0], (cM.toArray()[0] as number[])[1], (cM.toArray()[0] as number[])[2], (cM.toArray()[0] as number[])[3],
          (cM.toArray()[1] as number[])[0], (cM.toArray()[1] as number[])[1], (cM.toArray()[1] as number[])[2], (cM.toArray()[1] as number[])[3],
          (cM.toArray()[2] as number[])[0], (cM.toArray()[2] as number[])[1], (cM.toArray()[2] as number[])[2], (cM.toArray()[2] as number[])[3],
          (cM.toArray()[3] as number[])[0], (cM.toArray()[3] as number[])[1], (cM.toArray()[3] as number[])[2], (cM.toArray()[3] as number[])[3],
        )
      }
    }
  });
  return (<>
    { Math.abs(dh.d_i) > 2.7 * 0.2 && <mesh
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      geometry={corner.geometry}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      material={linkMaterial}
      ref={cornerRef}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    ></mesh> }
    { (Math.abs(dh.d_i) > 2.7 * 0.2 || Math.abs(dh.a_i_minus_1) > 2.7 * 0.2) && <mesh
      {...props}
      ref={meshX}
      // scale={active ? 1.5 : 1}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
      material={linkMaterial}
    >
      <cylinderBufferGeometry args={[0.2, 0.2, (difPositions?.[0] + (yzCombined < 0.2 * 2.7 ? (dh.a_i_minus_1 < 0 ? 0.6 : -0.6) : 0)) ?? 0, 16]} />
    </mesh> }
    { props.nextJointType === 'R' && sqrt(sum(difPositions?.[2] ** 2, difPositions?.[1] ** 2)) > 2.5 * 0.2 && <mesh
      {...props}
      ref={meshZ}
      // scale={active ? 1.5 : 1}
      onClick={(event) => setActive(active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
      material={linkMaterial}
    >
      <cylinderBufferGeometry args={[0.2, 0.2, ((sqrt(sum(difPositions?.[2] ** 2, difPositions?.[1] ** 2)) - 2.5 * 0.2)) ?? 0, 16]} />
    </mesh> }
  </>)
}

export default ThreeDLink;