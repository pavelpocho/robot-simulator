import { Text } from '@mantine/core';
import { useRobotContext } from '../../../../utils/contexts/RobotContext';
import { MathWrapper } from '../../math-wrapper';

export const JVJacobianTheory = () => {

  const { robot } = useRobotContext();
  
  return <>
    <Text>This simulation shows how Cartesian End Effector velocities can be obtained from joint velocities.</Text>
    <Text>
      This can be achieved with a matrix relating Joint Velocities to Cartesian velocities.
      We are looking for a matrix, which we can multiply with our joint velocities to produce a vector containing linear and angular Cartesian Velocities of the End Effector, like so:
    </Text>
    <MathWrapper
      symbolicTex={String.raw`\left[ \begin{array}{ccc} ^{0}${'\u005c'}upsilon \\ ^{0}\omega \end{array} \right] = {^{0}J(\Theta)}\dot{\Theta}`}
      expandedTex={String.raw`\left[ \begin{array}{ccc} ^{0}{${'\u005c'}upsilon}_{X} \\ ^{0}{${'\u005c'}upsilon}_{Y} \\ ^{0}{${'\u005c'}upsilon}_{Z} \\ ^{0}{\omega}_{X} \\ ^{0}{\omega}_{Y} \\ ^{0}{\omega}_{Z} \end{array} \right] =\left[ \begin{array}{ccc} ${[...Array(6).keys()].map(i => [...Array(robot?.jointPositions.length).keys()].map(j => String.raw`j_{${i+1}${j+1}}`).join(String.raw`&`)).join(String.raw`\\`)} \end{array} \right]\left[ \begin{array}{ccc} ${[...Array(robot?.jointPositions.length).keys()].map(i => String.raw`\dot{\theta}_{${i+1}}`).join(String.raw`\\`)} \end{array} \right]`}
      supportingTexts={[
        'The left side of the equation are the End Effector linear and angular velocities with respect to the 0th (Base) Frame (Yellow cube in Simulation window)',
        `The "Capital Theta Dot" symbol is a vector of Joint velocities.`,
        'The "Rest of the equation" is the Jaobian with the same reference frame as the Cartesian velocities.'
      ]}
    />
  </>
};