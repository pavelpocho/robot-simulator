import { List, Space, Text, Title } from '@mantine/core';
import { MathComponent } from 'mathjax-react';

export const IK3RRationale = () => {
  return <>
    <Title order={6}>What is inverse kinematics?</Title>
    <Space h={'xs'} />
    <Text>
      Imagine you have a robot with a gripper at the end and you want it to grab an item.<br/>
      You know where the item is located, but you don&apos;t know the combination of joint angles to get the robot&apos;s
      End Effector (the gripper at the end) to the position where your item is.
    </Text>
    <Space h={'xs'} />
    <Text>
      This is where inverse kinematics come in. The process allows you to find the joint positions required to achieve
      a certain End Effector position.
    </Text>
    <Space h={'md'} />
    <Title order={6}>Why this robot?</Title>
    <Space h={'xs'} />
    <Text>
      You might have noticed that in this app, Inverse kinematics is only available for specific types of 3R and 6R robots.<br/>
      This is because there is no general algorithm for analytically (without using iterative methods) solving inverse kinematics of robots,
      no one-size-fits-all equation like for forward kinematics or jacobians.
    </Text>
    <Space h={'xs'} />
    <Text>
      Because of this, finding a robot to do inverse kinematics for is a delicate balance of finding one that
      is &lsquo;general enough&rsquo;, yet still solvable. For planar robots, a robot with 3 joints works well.<br/>
      This is because to define the position and rotation (which together comprise transformation) of a point on a plane
      requires 3 parameters:
    </Text>
    <Space h={'xs'} />
    <List type='ordered'>
      <List.Item>Position along the X axis.</List.Item>
      <List.Item>Position along the Y axis.</List.Item>
      <List.Item>Angle about the Z axis (which way is the point &lsquo;looking&rsquo; along the plane).</List.Item>
    </List>
    <Space h={'xs'} />
    <Text>
      We need at least one joint for each of these parameters (making our robot &lsquo;general enough&rsquo;),
      but any more joints would introduce redundancies, which introduce needless complexities. After all, if you
      can already reach all the points (in a specific radius), why introduce any more joints?
    </Text>
  </>
}