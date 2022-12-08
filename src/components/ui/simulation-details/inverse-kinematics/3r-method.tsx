import { Space, Title, Text, List } from "@mantine/core"

export const IK3RMethod = () => {
  return <>
    <Title order={6}>How does this algorithm work?</Title>
    <Space h={'xs'} />
    <Text>
      At first glance, this seems like a fairly complicated problem, which means we have to simplify it.
      One way to simplify a problem like this is to copy the solution from a textbook, but that helps no one and
      makes the solution look even more mysterious and difficult. What we will do instead is break the problem
      into smaller pieces.
    </Text>
    <Space h={'md'} />
    <Title order={6}>Breaking the problem down</Title>
    <Space h={'xs'} />
    <Text>
      Let&apos;s think about what we want to do. We need to find the 3 joint angles from the position of the end effector.<br />
      So, our inputs are:
    </Text>
    <Space h={'xs'} />
    <List>
      <List.Item>X coordinate of the End Effector</List.Item>
      <List.Item>Y coordinate of the End Effector</List.Item>
      <List.Item>Z angle of the End Effector (which way it&apos;s facing)</List.Item>
    </List>
    <Space h={'xs'} />
    <Text>
      And we need to figure out the following:
    </Text>
    <List>
      <List.Item>Joint 1 position</List.Item>
      <List.Item>Joint 2 position</List.Item>
      <List.Item>Joint 3 position</List.Item>
    </List>
    <Space h={'md'} />
    <Title order={6}>Step 1 - Splitting into Rotation & Position</Title>
    <Space h={'xs'} />
    <Text>
      The first thing we can see is that we are looking for position and rotation.
      These are two distict problems which we can solve separately.
    </Text>
    <Space h={'md'} />
    <Title order={6}>Step 2 - What do we need to account for the rotation?</Title>
    <Space h={'xs'} />
    <Text>
      Take a second to move the robot around (don&apos;t change the rotation!). Notice anything?
      The final segment keeps on pointing in the same direction. Duh! We didn&apos;t the change angle, so this makes sense.
      It also shows us that the final angle is always determined by last joint position.
      No matter the selected angle and position, it&apos;s the final joint that adjusts the angle to the correct value.
      This will be useful later!
    </Text>
    <Space h={'md'} />
    <Title order={6}>Step 3 - The position</Title>
    <Space h={'xs'} />
    <Text>
      The position is a bit harder. We have already established that the final joint will be the one to determine the
      rotation. This leaves us with the previous two joints to determine the position.<br/>
      This is where we encounter a problem. Try changing the Z rotation value of the robot. What do you notice?
      The position of the End Effector does not change, yet the first two joint angles do.<br/>
      Try to think about what this means and how it could be overcome.
    </Text>
    <Space h={'md'} />
    <Title order={6}>What affects the position?</Title>
    <Space h={'xs'} />
    <Text>
      This is still a difficult problem, so let&apos;s split it again. Our final position is that of the end effector,
      but we cannot influence that using just the first two joints. It comprises of the angle of the first two joints
      as well as the angle of the last one. But we also know from before that the position of that last joint is such
      that the angle of the End effector is correct. What this means is that we can define a new &lsquo;target&rsquo; position
      which does not include the final link (and therefore the influence of the final joint) by simply subtracting the final
      link from the actual target position.
    </Text>
    <Space h={'xs'} />
    <Text>
      Simply put: We know the angle of the final link (it&apos;s the target Z angle), so we know how much to
      add or subtract from the X and Y coordinates to get the desired <b>Cartesian position (X, Y)</b> of the last joint. This new
      desired position is only dependent on the first two joints, simplifying our problem. The theory is that if we
      get the final joint into the correct position on our plane and if we get the last link into the correct angle,
      we will get to the correct End Effector position.
    </Text>
  </>
}