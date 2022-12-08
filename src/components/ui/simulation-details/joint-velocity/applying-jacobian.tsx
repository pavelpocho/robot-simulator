import { useMemo } from "react";
import { useJacobianCodeContext } from "../../../../utils/contexts/JacobianCodeContext";
import { jsMatrixToJax } from "../../../../utils/js-to-jax";
import { MathWrapper } from "../../math-wrapper";
import { Text } from '@mantine/core';

export const JVApplyingJacobian = () => {

  const { finalJacobianData, evaluatedJac } = useJacobianCodeContext();
  const allFinalJac = useMemo(() => jsMatrixToJax(finalJacobianData?.finalJacobian ?? ''), [ finalJacobianData ]);

  return <>
    { (() => {
      const rows = allFinalJac.map((ajs, i) => ajs.join(' & ')).join(String.raw` \\ `);
      const calcRows = evaluatedJac ? (evaluatedJac.toArray() as number[][]).map((ajs, i) => ajs.map(a => a.toFixed(3)).join(' & ')).join(String.raw` \\ `) : '';
      return <MathWrapper 
        symbolicTex={String.raw`{^{${0}}J}=\left[ \begin{array}{ccc}${rows}\end{array} \right]`}
        calculatedTex={calcRows != '' ? String.raw`{^{${0}}J}=\left[ \begin{array}{ccc}${calcRows}\end{array} \right]` : undefined}
      />
    })() }
    <Text>In the simulation, the above expression is compiled and used to determine the Cartesian velocities above using the following formula:</Text>
    <MathWrapper symbolicTex={String.raw`\left[ \begin{array}{ccc} ^{0}${'\u005c'}psilon \\ ^{0}\omega \end{array} \right] = {^{0}J(\Theta)}\dot{\Theta}`} />
    <Text>As you can see, it&apos;s just a straightforward multiplication with a vector of the joint velocities you provide as input above.</Text>
  </>
}