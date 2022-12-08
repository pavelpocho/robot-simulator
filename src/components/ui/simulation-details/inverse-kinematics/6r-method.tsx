import { Space, Title, Text } from "@mantine/core"

export const IK6RMethod = () => {
  return <>
    <Title order={6}>How does this algorithm work?</Title>
    <Space h={'xs'} />
    <Text>
      This solution is very daunting at first glance. But as always, splitting the problem
      into smaller ones helps make it easier.
    </Text>
    <Space h={'md'} />
    <Title order={6}>Breaking the problem down</Title>
    <Space h={'xs'} />
    <Text>
      Before we do anything else, we need to stop thinking about the last link.
      Notice how when you change the End effector angle, it moves the whole robot
      all over the place. This makes the whole problem needlessly complicated. We will
      instead focus on where the last joint is. Note that this is slighly hard to see because
      the last three joints all rotate about a single point. This is so that they only affect
      the rotation and not the position.
    </Text>
    <Space h={'xs'} />
    <Text>
      Keeping in mind the fact that we are ignoring the last link, we can move on.
      Try going to the Forward kinematics section and move the first joint around.<br/>
      Notice how it rotates the entire robot and the rest of it (excluding the last link!)
      is all in one (almost) plane, which rotates about the origin. One of the joints is not actually
      on the plane so that it can be seen better, but it works the same way.
    </Text>
    <Space h={'xs'} />
    <Text>
      So we know the first joint rotates a plane around the origin.
      The second and third joint work in that plane just like the first two joints of our example robot.
      And the final three joints simply correct for the rotation, just like in the 3R example,
      except now it&apos;s three joints for three axis, instead of just one.
    </Text>
    <Space h={'xs'} />
    <Text>
      We know how to solve the second part. The third will be a bit tricky but is doable.
      The only remaining challenge is how to properly use the first joint. So let&apos;s do it.
    </Text>
    <Space h={'xs'} />
  </>
}