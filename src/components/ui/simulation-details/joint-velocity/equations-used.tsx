import { Text } from '@mantine/core';
import { MathWrapper } from '../../math-wrapper';

export const JVEquationsUsed = () => {
  return <>
    <Text>The above equation does not <i>mean</i> much on it&apos;s own. Let&apos;s see what it really says by working through the steps used to create this simulation.</Text>
    <Text>For every revolute joint, the following equations need to be used:</Text>
    <MathWrapper tex={String.raw`^{i+1}\omega_{i+1}={_{i}^{i+1}}{R}\;{{^i}\omega_{i}}+\dot{\theta}_{i+1}\;^{i+1}{\hat{Z}}_{i+1}`} />
    <MathWrapper tex={String.raw`^{i+1}{${'\u005c'}upsilon}_{i+1}={^{i+1}_i}R({^i{${'\u005c'}upsilon}_i+^{i}\omega{_i}\times{^iP_{i+1}}})`} />
    <Text>For every prismatic joint, the following equations need to be used:</Text>
    <MathWrapper tex={String.raw`^{i+1}\omega_{i+1}={_{i}^{i+1}}{R}\;{{^i}\omega_{i}}`} />
    <MathWrapper tex={String.raw`^{i+1}{${'\u005c'}upsilon}_{i+1}={^{i+1}_i}R({^i{${'\u005c'}upsilon}_i+^{i}\omega{_i}\times{^iP_{i+1}}})+\dot{d}_{i+1}\;{^{i+1}\hat{Z}_{i+1}}`} />
    <Text>Each equation uses the input from the previous ones.</Text>
  </>
};