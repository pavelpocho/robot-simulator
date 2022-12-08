import { Button, Group, Space, TextInput, Title } from "@mantine/core";
import { IconCircleX, IconPlus } from "@tabler/icons";
import React from "react";
import { useJacobianCodeContext } from "../../../utils/contexts/JacobianCodeContext";
import { useRobotContext } from "../../../utils/contexts/RobotContext";

export const RobotTypeUI: React.FC = () => {

  const { setJacobianCode } = useJacobianCodeContext();
  const { robot, setRobot } = useRobotContext();

  const changeRobot = (typeDiff: number, v: string) => {
    setRobot(r => {
      if (typeDiff >= 0) {
        if (v.split('').filter(c => c === 'R' || c === 'P' || c === 'E').length !== v.length) {
          return { ...r };
        }
        const newDhRows = [...Array(typeDiff).keys()].map(i => ({
          i: i + 1 + r.dhTable.length, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 
        }));
        const newPositionsAndVelocities = Array(typeDiff).fill(0);
        return {
          ...r, 
          type: v, 
          dhTable: r.dhTable.concat(newDhRows).map(d => ({ ...d })),
          jointPositions: r.jointPositions.concat(newPositionsAndVelocities),
          jointVelocities: r.jointVelocities.concat(newPositionsAndVelocities)
        }
      }
      else {
        return {
          ...r,
          type: v,
          dhTable: r.dhTable.slice(0, typeDiff).map(d => ({ ...d })),
          jointPositions: r.jointPositions.slice(0, typeDiff),
          jointVelocities: r.jointVelocities.slice(0, typeDiff)
        }
      }
    });
    setJacobianCode(null);
  }

  return <>
    <Title order={4}>Robot Configuration</Title>
    <Space h={'sm'} />
    <Group>
      <TextInput variant={'filled'} width={100} disabled={false} title="Robot type" value={robot?.type} type="text" onChange={(e) => {
        const typeDiff = e.currentTarget.value.length - robot.type.length;
        const v = e.currentTarget.value;
        changeRobot(typeDiff, v)
      }} />
      <Button onClick={() => {
        const typeDiff = 1;
        const v = robot?.type.split('');
        v.splice(robot?.type.length - 1, 0, 'R');
        changeRobot(typeDiff, v.join(''));
      }} leftIcon={<IconPlus />} variant="filled" color='gray'>Add R</Button>
      <Button onClick={() => {
        const typeDiff = 1;
        const v = robot?.type.split('');
        v.splice(robot?.type.length - 1, 0, 'P');
        changeRobot(typeDiff, v.join(''));
      }} leftIcon={<IconPlus />} variant="filled" color='gray'>Add P</Button>
      <Button disabled={robot?.type.length <= 1} onClick={() => {
        const typeDiff = -1;
        const v = robot?.type.split('');
        if (v.length > 1) {
          v.splice(robot?.type.length - 2, 1);
          changeRobot(typeDiff, v.join(''));
        }
      }} leftIcon={<IconCircleX />} variant="filled" color='gray'>Remove last</Button>
    </Group>
  </>
}