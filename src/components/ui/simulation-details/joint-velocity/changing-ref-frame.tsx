import { useMemo } from "react";
import { useJacobianCodeContext } from "../../../../utils/contexts/JacobianCodeContext";
import { useRobotContext } from "../../../../utils/contexts/RobotContext";
import { jsMatrixToJax } from "../../../../utils/js-to-jax";
import { HorScr, MathWrapper } from "../../math-wrapper";
import { Space, Tabs, Text } from '@mantine/core';

export const JVChangingRefFrame = () => {

  const { finalJacobianData, evaluatedJac } = useJacobianCodeContext();
  const { robot } = useRobotContext();
  const allFinalJac = useMemo(() => jsMatrixToJax(finalJacobianData?.finalJacobian ?? ''), [ finalJacobianData ]);
  const allDoubledRotationMatrices = useMemo(() => finalJacobianData?.doubledRotationMatrices.map(r => jsMatrixToJax(r)), [ finalJacobianData ]);
  const allCombinedDoubledRotationMatrix = useMemo(() => jsMatrixToJax(finalJacobianData?.downToZeroRotMat ?? ''), [ finalJacobianData ]);

  return <>
    <Text>To change the frame of reference, we need to use the rotation matrices of this robot, but we need to stack two of them to match the dimensions:</Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`dm_0`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          { allDoubledRotationMatrices?.map((dm, i) => <Tabs.Tab key={i} value={`dm_${i}`}>Doubled Matrix {i + 1}</Tabs.Tab>) }
        </Tabs.List>
        { allDoubledRotationMatrices?.map((dm, i) => {
          const rows = dm.map(ajs => ajs.join(' & ')).join(String.raw` \\ `);
          return <Tabs.Panel value={`dm_${i}`} key={i} style={{
            alignItems: 'center',
            padding: '0.5rem'
          }}>
            <MathWrapper key={i} symbolicTex={String.raw`{_{${i+1}}^{${i}}}R=\left[ \begin{array}{ccc}${rows}\end{array} \right]`} />
          </Tabs.Panel>
        }) }
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>Combining these gives:</Text>
    <Space h={'md'} />
    { (() => {
      const rows = allCombinedDoubledRotationMatrix.map((ajs, i) => ajs.join(' & ')).join(String.raw` \\ `);
      return <MathWrapper symbolicTex={String.raw`{_{${robot.type.length}}^{${0}}}R=\left[ \begin{array}{ccc}${rows}\end{array} \right]`} />
    })() }
    <Space h={'md'} />
    <Text>Finally, the jacobian has to be converted using this matrix:</Text>
    <Space h={'md'} />
    <MathWrapper symbolicTex={String.raw`^{0}J(\Theta)=\left[ \begin{array}{ccc} ^0_${robot.type.length}R & 0 \\ 0 & ^0_${robot.type.length}R \end{array} \right]{^{${robot.type.length}}J(\Theta)}`} />
    <Space h={'md'} />
    <Text>Which gives:</Text>
    <Space h={'md'} />
    { (() => {
      const rows = allFinalJac.map((ajs, i) => ajs.join(' & ')).join(String.raw` \\ `);
      const calcRows = evaluatedJac ? (evaluatedJac.toArray() as number[][]).map((ajs, i) => ajs.map(a => a.toFixed(3)).join(' & ')).join(String.raw` \\ `) : '';
      return <MathWrapper 
        symbolicTex={String.raw`{^{${0}}J}=\left[ \begin{array}{ccc}${rows}\end{array} \right]`}
        calculatedTex={calcRows != '' ? String.raw`{^{${0}}J}=\left[ \begin{array}{ccc}${calcRows}\end{array} \right]` : undefined}
      />
    })() }
  </>
}