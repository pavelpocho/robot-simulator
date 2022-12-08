import { useInputTypeContext } from "../../../../utils/contexts/InputTypeContext";
import { useRobotContext } from "../../../../utils/contexts/RobotContext";
import { getMathJaxTMSolvedForRow, getMathJaxTMSubstitutedForRow, useMathJaxTMCombined } from "../../../../utils/hooks/robotHooks";
import { InputType } from "../../input-type";
import { HorScr, MathWrapper } from "../../math-wrapper";
import { Space, Tabs, Text } from '@mantine/core';

export const FKDetailExplanation = () => {

  const { robot } = useRobotContext();
  const { inputType } = useInputTypeContext();

  const combinedMatrices = useMathJaxTMCombined();

  return inputType === InputType.FwdKin ? (<>
    <Text>
      This simulation solves the Forward kinematics for the robot you chose in the previous step.
      It outputs the Cartesian position and an angle of your choice of the effector.
    </Text>
    <Space h={'sm'} />
    <Text>
      This is done by determining the Transformation Matrix for each pair of links from the base until the end.
    </Text>
    <Space h={'sm'} />
    <Text>
      Below is a representation of the transformation between each pair of link-frames from the base all the way to the end-effector.
      These are all derived from a single formula, with different parameters applied. This formula is only concerned with a transformation
      between two frames.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`tm_0`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          { robot.dhTable.map((_, i) => <Tabs.Tab key={i} value={`tm_${i}`}>Transform Matrix {i + 1}</Tabs.Tab>) }
        </Tabs.List>
        { robot.dhTable.map((_, i) => <Tabs.Panel value={`tm_${i}`} key={i} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`{_i^{i-1}}T=\left[ \begin{array}{ccc}c\theta_i & -s\theta_i & 0 & a_{i-1} \\ s\theta_ic\alpha_{i-1} & c\theta_ic\alpha_{i-1} & -s\alpha_{i-1} & -s\alpha_{i-1}d_i \\ s\theta_is\alpha_{i-1} & c\theta_is\alpha_{i-1} & c\alpha_{i-1} & c\alpha_{i-1}d_i \\ 0 & 0 & 0 & 1\end{array} \right]`}
        substitutedTex={getMathJaxTMSubstitutedForRow(robot.dhTable, i+1)}
        calculatedTex={getMathJaxTMSolvedForRow(robot.dhTable, i+1)}
      /></Tabs.Panel>) }
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      In order to combine these transformation, the matrices must be multiplied together, which yields the below results:
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`cm_0`} style={{
        justifyContent: 'stretch'
      }}>
        <Tabs.List>
          { combinedMatrices.map((_, i) => <Tabs.Tab key={i} value={`cm_${i}`}>Combined Matrix {i + 1}</Tabs.Tab>) }
        </Tabs.List>
        { combinedMatrices.map((c, i) => <Tabs.Panel key={i} value={`cm_${i}`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
          calculatedTex={c}
        /></Tabs.Panel>) }
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    </>) : <></>
};