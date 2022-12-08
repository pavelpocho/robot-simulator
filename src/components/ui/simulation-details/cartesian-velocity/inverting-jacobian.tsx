import { Space, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useJacobianCodeContext } from '../../../../utils/contexts/JacobianCodeContext';
import { jsMatrixToJax } from '../../../../utils/js-to-jax';
import { MathWrapper } from '../../math-wrapper';

export const CVInvertingJacobian = () => {

  const { finalJacobianData, evaluatedJac, invertedJac } = useJacobianCodeContext();
  const allFinalJac = useMemo(() => jsMatrixToJax(finalJacobianData?.finalJacobian ?? ''), [ finalJacobianData ]);

  return <>
    <Text>This simulation requires the Jacobian.</Text>
    <Text>Creation of the Jacobian is described in the previous visualization (Joint velocity)</Text>
    <Text>This is the jacobian of the end effector in terms of the origin frame:</Text>
    <Space h={'md'} />
    { (() => {
      const rows = allFinalJac.map(ajs => ajs.join(' & ')).join(String.raw` \\ `);
      return <MathWrapper symbolicTex={String.raw`{^{${0}}J}=\left[ \begin{array}{ccc}${rows}\end{array} \right]`} />
    })() }
    <Space h={'md'} />
    <Text>An inverted Jacobian needs to be used in order get Joint velocities from Cartesian velocities.</Text>
    <Text>Inverting matrices is another topic. But in short, if the matrix is square, it can be inverted fairly <a href='https://www.google.com/search?rls=en&q=how+to+inverse+matrix'>simply.</a></Text>
    <Text>If the matrix is not square, the <a href='https://en.wikipedia.org/wiki/Moore–Penrose_inverse'>Moore-Penrose method</a> has to be used.</Text>
    <Text>It does not make sense to even try anything other than solving the matrix and then inverting the numbers.</Text>
    <Text>Here is the Jacobian for this robot with numbers substituted:</Text>
    <Space h={'md'} />
    { (() => {
      if (evaluatedJac) {
        const rows = (evaluatedJac.toArray() as number[][]).map(ajs => ajs.map(a => a.toFixed(3)).join(' & ')).join(String.raw` \\ `);
        return <MathWrapper calculatedTex={String.raw`{^{${0}}J}=\left[ \begin{array}{ccc}${rows}\end{array} \right]`} />;
      }
      return <i>No data here yet, try moving the robot!</i>;
    })() }
    <Space h={'md'} />
    <Text>And here is the Moore-Penrose inverse:</Text>
    <Space h={'md'} />
    { (() => {
      if (invertedJac) {
        const rows = (invertedJac.toArray() as number[][]).map(ajs => ajs.map(a => a.toFixed(3)).join(' & ')).join(String.raw` \\ `);
        return <MathWrapper calculatedTex={String.raw`{^{${0}}J^{-1}}=\left[ \begin{array}{ccc}${rows}\end{array} \right]`} />;
      }
      return <i>No data here yet, try moving the robot!</i>;
    })() }
    <Space h={'md'} />
    <Text>This Jacobian describes the combination of joint movements for any input Cartesian velocity.</Text>
    <Text>This simulation uses this Jacobian directly to determine joint velocities.</Text>
    <Text>The joint positions are then updated using this joint velocity, so there is no cheating going on, this calculation is always used.</Text>
    <Text>The relationship used can be described with the following equation:</Text>
    <MathWrapper symbolicTex={String.raw`\dot{\Theta} = \left[ \begin{array}{ccc} ^{0}${'\u005c'}psilon \\ ^{0}\omega \end{array} \right] {^{0}J(\Theta)^{-1}}`} />
  </>
};