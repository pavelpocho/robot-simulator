import { Button, Grid, Select, Space, Title } from "@mantine/core";
import { IconApple, IconArrowBack, IconArrowForward, IconArrowLeftCircle, IconArrowLoopRight, IconArrowsUpLeft, IconRotate, IconRoute } from "@tabler/icons";
import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext";
import { useJacobianCodeContext } from "../../../utils/contexts/JacobianCodeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { det, matrix, pinv } from 'mathjs';
import { isPieper } from "../../../utils/hooks/robotHooks";
import { AR } from "../../../wrapper";

export enum InputType {
  FwdKin = 0,
  InvKin = 1,
  JointVel = 2,
  CartVel = 3,
  Trajectory = 4,
  Torques = 5
}

export const InputTypeUI = (props: { inputType: InputType | null, setInputType: React.Dispatch<React.SetStateAction<InputType | null>> }) => {
  
  const names = [ "Forward kinematics", "Inverse kinematics", "Joint velocities", "Cartesian velocities", "Trajectory generation", "Dynamic simulation" ];
  const inputTypes = [ InputType.FwdKin, InputType.InvKin, InputType.JointVel, InputType.CartVel, InputType.Trajectory, InputType.Torques ];

  const { jacobianCode } = useJacobianCodeContext();
  const { robot, setRobot } = useRobotContext();

  const vars = {};
  robot.dhTable.forEach((d, i) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vars[`t${i+1}`] = d.theta_i;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vars[`d${i+1}`] = d.d_i;
  });
  let d = false;
  const evalJac = jacobianCode?.evaluate(vars);
  try {
    evalJac ? pinv(evalJac) : matrix([[0, 0], [0, 0]]);
  } catch (e) {
    d = true;
  }

  const buttonConfigs = [{
    text: 'Forward kinematics',
    icon: <IconArrowForward style={{
      height: '48px',
      width: '48px'
    }} />,
    onClick: () => { props.setInputType(0) }
  }, {
    text: 'Inverse kinematics',
    limitedTo: 'RRRE',
    icon: <IconArrowBack style={{
      height: '48px',
      width: '48px'
    }} />,
    onClick: () => { 
      props.setInputType(1)
      if (robot.type != 'RRRRRRE') {
        setRobot((r) => ({ ...r, angleRepresentation: AR.XYZFixed }))
      }
    }
  }, {
    text: 'Joint velocity',
    onlyWithJacobian: true,
    icon: <IconRotate style={{
      height: '48px',
      width: '48px'
    }} />,
    onClick: () => { props.setInputType(2) }
  }, {
    text: 'Cartesian velocity',
    onlyWithJacobian: true,
    forceDisable: d,
    icon: <IconArrowsUpLeft style={{
      height: '48px',
      width: '48px'
    }} />,
    onClick: () => { props.setInputType(3) }
  }/*, {
    text: 'Trajectory generation',
    icon: <IconRoute style={{
      height: '48px',
      width: '48px'
    }} />,
    onClick: () => { props.setInputType(4) }
  }, {
    text: 'Dynamic simulation',
    icon: <IconApple style={{
      height: '48px',
      width: '48px'
    }} />,
    onClick: () => { props.setInputType(5) }
  }*/];

  return <>
    <Title order={4}>Visualization type</Title>
    <Space h={'sm'} />
    <Grid gutter='md'>
      { buttonConfigs.map((b, i) => <Grid.Col span={4} key={i}><Button disabled={
        (b.limitedTo == 'RRRE' && (!isPieper(robot) && (robot.type != b.limitedTo || robot.dhTable.find(dh => dh.d_i != 0 || dh.alpha_i_minus_1 != 0) != null))) ||
        (b.onlyWithJacobian && jacobianCode == null) ||
        (b.forceDisable === true)
      } styles={{
        label: {
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        },
        root: {
          height: 'auto',
          padding: '24px',
          width: '100%'
        }
      }} variant="filled" color='gray' onClick={b.onClick}>
        { b.icon }
        { b.text }
      </Button></Grid.Col>) }
    </Grid>
    {/* <Select variant="filled" data={inputTypes.map(i => ({ value: i.toString(), label: names[i], disabled: (i == 2 || i == 3) && jacobianCode == null }))} value={props.inputType.toString()} onChange={(v) => { if (v) props.setInputType(parseInt(v)) } } ></Select> */}
  </>

  // return <div>
  //   <div style={{
  //     overflowX: 'auto',
  //     width: '100%',
  //     display: 'flex',
  //     flexWrap: 'nowrap'
  //   }} >
  //     { inputTypes.map((t, i) => {
  //       return <button disabled={(t === InputType.JointVel || t === InputType.CartVel) && jacobianCode == null} style={{ whiteSpace: 'nowrap' }} className={ t === c?.inputType ? 'selected' : '' } key={i} onClick={() => {c?.setInputType(t)}}> 
  //         {names[i]}
  //       </button>
  //     }) }
  //   </div>
  // </div>
}