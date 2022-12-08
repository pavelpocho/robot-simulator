import { Space, Table, Tabs, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useJacobianCodeContext } from '../../../../utils/contexts/JacobianCodeContext';
import { useRobotContext } from '../../../../utils/contexts/RobotContext';
import { jsNumberToJax, jsVectorToJax } from '../../../../utils/js-to-jax';
import { HorScr, MathWrapper } from '../../math-wrapper';

export const JVEquationsApplied = () => {
  
  const { robot } = useRobotContext();
  const { allVs, allOmegas, jacobianSection2DArray } = useJacobianCodeContext();

  const allJaxVs = useMemo(() => {
    return allVs.map(v => jsVectorToJax(v));
  }, [ allVs ]);

  const allJaxOmegas = useMemo(() => {
    return allOmegas.map(v => jsVectorToJax(v));
  }, [ allOmegas ]);

  const allJaxSections = useMemo(() => {
    return jacobianSection2DArray.map(j => j.map(k => jsNumberToJax(k)));
  }, [ jacobianSection2DArray ]);
  
  return <>
    <Text>This is what you get in this case:</Text>
    <Text>Angular velocities:</Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`omega_0`}>
        <Tabs.List>
          { allJaxOmegas.map((_, i) => <Tabs.Tab key={i} value={`omega_${i}`}>{i == allJaxOmegas.length - 1 ? 'End Effector' : `Joint ${i + 1}`}</Tabs.Tab>) }
        </Tabs.List>
        { allJaxOmegas.map((omega, i) => <Tabs.Panel key={i} value={`omega_${i}`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper symbolicTex={String.raw`{^{${i+1}}}\omega_{${i+1}}=\left[ \begin{array}{ccc}${omega[0]} \\ ${omega[1]} \\ ${omega[2]}\end{array} \right]`} />
        </Tabs.Panel>) }
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>Linear velocities:</Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`v_0`}>
        <Tabs.List>
          { allJaxVs.map((_, i) => <Tabs.Tab key={i} value={`v_${i}`}>{i == allJaxOmegas.length - 1 ? 'End Effector' : `Joint ${i + 1}`}</Tabs.Tab>) }
        </Tabs.List>
        { allJaxVs.map((v, i) => <Tabs.Panel key={i} value={`v_${i}`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper symbolicTex={String.raw`{^{${i+1}}}v_{${i+1}}=\left[ \begin{array}{ccc}${v[0]} \\ ${v[1]} \\ ${v[2]}\end{array} \right]`} />
        </Tabs.Panel>) }
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>Next, we take the linear and angular velocity of the joint we want to get a Jacobian for.</Text>
    <Text>End Effector (Angular velocity)</Text>
    <MathWrapper tex={String.raw`{^{${allJaxOmegas.length}}}\omega_{${allJaxOmegas.length}}=\left[ \begin{array}{ccc}${allJaxOmegas[allJaxOmegas.length - 1][0]} \\ ${allJaxOmegas[allJaxOmegas.length - 1][1]} \\ ${allJaxOmegas[allJaxOmegas.length - 1][2]}\end{array} \right]`} />
    <Text>End Effector (Linear velocity)</Text>
    <MathWrapper tex={String.raw`{^{${allJaxVs.length}}}v_{${allJaxVs.length}}=\left[ \begin{array}{ccc}${allJaxVs[allJaxVs.length - 1][0]} \\ ${allJaxVs[allJaxVs.length - 1][1]} \\ ${allJaxVs[allJaxVs.length - 1][2]}\end{array} \right]`} />
    <Text>Next, the multiple of each joint velocity is taken out of each element of the desired joint.</Text>
    <Space h={'md'} />
    <HorScr>
      <Table striped={true} border={0} highlightOnHover={true}>
        <thead>
          <tr>
            <td></td>
            {
              robot.dhTable.map((d, i) => i < robot.dhTable.length - 1 ? <td key={i}><MathWrapper noBorder={true} tex={String.raw`${robot.type[i] === 'R' ? String.raw`\dot{\theta}_${i+1}` : robot.type[i] === 'P' ? String.raw`\dot{d}_${i+1}` : ''}`} /></td> : null)
            }
          </tr>
        </thead>
        <tbody>
          {allJaxSections.map((ajs, i) => <tr key={i}>
            <td style={{
              minWidth: '15rem'
            }}>
              Row {i%3 + 1} { i+1 <= 3 ? '(Lin. vel. vector)' : '(Ang. vel. vector)' }
            </td>
            { ajs.map((a, j) => <td key={j}>
              <MathWrapper noBorder={true} tex={String.raw`${a}`} />
            </td>) }
          </tr>)}
        </tbody>
      </Table>
    </HorScr>
    <Space h={'md'} />
    <Text>The table above is essentially the jacobian, but it is the jacobian in the reference frame of the End Effector.</Text>
    {(() => {
      const rows = allJaxSections.map((ajs, i) => ajs.join(' & ')).join(String.raw` \\ `);
      return <MathWrapper symbolicTex={String.raw`{^{${robot.dhTable.length}}}J=\left[ \begin{array}{ccc}${rows}\end{array} \right]`} />
    })()}
    <Text>We now need to change it to be in the reference frame of the base. (See next section)</Text>
  </>
};