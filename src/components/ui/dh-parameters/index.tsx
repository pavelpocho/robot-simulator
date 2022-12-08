import { Space, Title, Text, NumberInput, Group, Popover, UnstyledButton, Button, RingProgress, Flex } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { useJacobianCodeContext } from "../../../utils/contexts/JacobianCodeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { useNumberOfJoints } from "../../../utils/hooks/robotHooks";
import { AR } from "../../../wrapper";

export const DHParametersUI = ({ recalculateJacobian, jls }: { recalculateJacobian: () => void, jls: string } ) => {

  const PlanarRobot = {
    type: 'RRRE',
    jointPositions: [1.57, -0.785, -0.785],
    dhTable: [
      { i: 1, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: 1.57 },
      { i: 2, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: -0.785 },
      { i: 3, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: -0.785 },
      { i: 4, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
    ],
    cartesianEEPositions: [0, 0, 0, 0, 0, 0, 0],
    jointVelocities: [0, 0, 0],
    cartesianEEVelocities: [0, 0, 0, 0, 0, 0],
    ikUpdate: false,
    fkUpdate: false,
    angleRepresentation: AR.XYZFixed
  }
  
  const PieperRobot = {
    type: 'RRRRRRE',
    jointPositions: [0, 0.06, 1.51, 0, 0, 0],
    dhTable: [
      { i: 1, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 2, theta_i: 0 },
      { i: 2, a_i_minus_1: 0, alpha_i_minus_1: -1.57, d_i: 1.5, theta_i: 0.06 },
      { i: 3, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: -1.5, theta_i: 1.51 },
      { i: 4, a_i_minus_1: 0, alpha_i_minus_1: 1.57, d_i: 2, theta_i: 0 },
      { i: 5, a_i_minus_1: 0, alpha_i_minus_1: -1.57, d_i: 0, theta_i: 0 },
      { i: 6, a_i_minus_1: 0, alpha_i_minus_1: 1.57, d_i: 0, theta_i: 0 },
      { i: 7, a_i_minus_1: 2, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 },
    ],
    cartesianEEPositions: [0, 0, 0, 0, 0, 0, 0],
    jointVelocities: [0, 0, 0],
    cartesianEEVelocities: [0, 0, 0, 0, 0, 0],
    ikUpdate: false,
    fkUpdate: false,
    angleRepresentation: AR.XYZFixed
  }

  const { robot, setRobot } = useRobotContext();
  const { jacobianCode, setJacobianCode } = useJacobianCodeContext();
  return <>
    <Title order={4}>Denavit-Hartenberg Parameters</Title>
    <Space h={'sm'} />
    <Flex>
      <Button color={'gray'} compact={true} variant={'outline'} onClick={() => {
        setJacobianCode(null);
        setRobot(PlanarRobot);
      }}>3R Planar</Button>
      <Space w={'md'} />
      <Button color={'gray'} compact={true} variant={'outline'} onClick={() => {
        setJacobianCode(null);
        setRobot(PieperRobot);
      }}>6R Pieper-compatible</Button>
    </Flex>
    <Space h={'sm'} />
    <table>
      <thead><tr>
        <td></td>
        <td><Text size='sm' align="center" weight={'bold'}>a_i-1</Text></td>
        <td><Text size='sm' align="center" weight={'bold'}>α_i-1</Text></td>
        <td><Text size='sm' align="center" weight={'bold'}>d_i</Text></td>
        <td><Text size='sm' align="center" weight={'bold'}>θ_i</Text></td>
      </tr></thead>
      <tbody>{
        [...Array((useNumberOfJoints() ?? 0) + 1).keys()].map(i => <tr key={i + 1}>
          <td style={{ width: '100px', paddingRight: '12px' }}>{robot?.type[i] === 'E' ? 'End Eff.' : `Joint ${i+1}`}</td>
          <td style={{ width: '160px' }}><NumberInput stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} 
          stepHoldDelay={300} variant='filled' precision={2} step={0.2} placeholder={`a_i-1`} value={robot.dhTable[i].a_i_minus_1} onChange={(v) => {
            if (v != undefined) {
              setJacobianCode(null);
              setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, a_i_minus_1: v }) : d) }));
            }
          }} /></td>
          <td style={{ width: '160px' }}><NumberInput stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} 
          stepHoldDelay={300} variant='filled' precision={2} step={0.02} placeholder={`alpha_i-1`} value={robot.dhTable[i].alpha_i_minus_1} onChange={(v) => {
            if (v != undefined) {
              setJacobianCode(null);
              setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, alpha_i_minus_1: v }) : d) }));
            }
          }}/></td>
          <td style={{ width: '160px' }}>{ robot?.type[i] === 'P' ? <Text weight={'bold'} size={'sm'} align='center'>d_{i+1} (Joint Variable)</Text> : <NumberInput stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} 
          stepHoldDelay={300} precision={2} variant='filled' step={0.2} placeholder={`d_i`} value={robot.dhTable[i].d_i} onChange={(v) => { 
            if (v != undefined) {
              setJacobianCode(null);
              setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, d_i: v }) : d) }))
            }
          }}/> }</td>
          <td style={{ width: '160px' }}>{ robot?.type[i] === 'R' ? <Text weight={'bold'} size={'sm'} align='center'>θ_{i+1} (Joint Variable)</Text> : <NumberInput stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} 
          stepHoldDelay={300} precision={2} variant='filled' step={0.02} placeholder={`theta_i`} value={robot.dhTable[i].theta_i} onChange={(v) => {
            if (v != undefined) {
              setJacobianCode(null); 
              setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, theta_i: v }) : d) }))
            }
          }}/> }</td>
        </tr>)
      }</tbody>
    </table>
    <Space h='sm' />
    <Group>
      { jacobianCode == null && <>
        <Text size={'sm'} weight={'bold'} color={'red'}>
          Jacobian not calculated!
        </Text>
        <Popover width={200} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <UnstyledButton style={{ marginTop: '4px' }}><IconInfoCircle size={'16px'} /></UnstyledButton>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">You cannot select the Joint and Cartesian velocity visualization types. Calculating the Jacobian takes time and requires a lot of processing power!</Text>
          </Popover.Dropdown>
        </Popover>
        { (jls == '0%' || jacobianCode == null) && <Button disabled={jls != '0%' && jls != '100%'}  color='gray' onClick={() => {recalculateJacobian()}}>Calculate Jacobian</Button> }
        { (jls != '0%' && jls != '100%') && <>
          <RingProgress roundCaps size={36} thickness={5} sections={[{ value: parseInt(jls.slice(0, -1)), color: 'gray' }]} />
          <Text size={'sm'} weight={'bold'}>Processing: {parseInt(jls.slice(0, -1)).toFixed(2).toString()}%</Text>
        </> }
      </> }
    </Group>
  </>
}