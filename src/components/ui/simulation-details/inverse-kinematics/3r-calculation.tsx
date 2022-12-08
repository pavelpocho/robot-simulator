import { List, Space, Tabs, Text, Title } from "@mantine/core"
import { HorScr, MathWrapper } from "../../math-wrapper"

export const IK3RCalculation = () => {
  return <>
    <Title order={6}>How does this algorithm work?</Title>
    <Space h={'xs'} />
    <Text>
      The steps for the calculation are:
    </Text>
    <Space h={'xs'} />
    <List type='ordered'>
      <List.Item>Determine a new &lsquo;target&rsquo; position based on the angle of the last link, which can be influenced using the first two joints</List.Item>
      <List.Item>Solve the first two joint angles to achieve this &lsquo;target&rsquo;</List.Item>
      <List.Item>Determine the final angle such that the last link points in the right direction and reaches the defined position</List.Item>
    </List>
    <Space h={'md'} />
    <Title order={6}>Step 1 - Determine new target position</Title>
    <Space h={'xs'} />
    <Text>
      This involves subtracting the length of the final link from the user-defined target position.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`x`}>
        <Tabs.List>
          <Tabs.Tab value={`x`}>X direction</Tabs.Tab>
          <Tabs.Tab value={`y`}>Y direction</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`x`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`x_{target}=x_{user\_target} - a_3*cos(\theta_{Z})`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`y`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`y_{target}=y_{user\_target} - a_3*sin(\theta_{Z})`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      We now have the target point we want to reach with our first two joints.
      (Note that in this example the angle at which we reach it is irrelevant, as it will be corrected by the final joint!)
    </Text>
    <Space h={'md'} />
    <Title order={6}>Step 2 - Solve for the first two joint angles</Title>
    <Space h={'xs'} />
    <Text>
      This is the core of the whole problem: How do we find the two angles that get us to
      the defined X and Y coordinates?<br/>
      This is still a difficult problem. So what do we do next? You guessed it, we split the problem!<br/>
      The issue here is that when working with X and Y coordinates, you have to consider both of them at once,
      which is hard. If we instead specify the same position in terms of an angle and a distance (Google: Polar coordinates),
      we can focus on the distance (specified as a single number!) and then implement the angle later.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`angle`}>
        <Tabs.List>
          <Tabs.Tab value={`angle`}>Angle</Tabs.Tab>
          <Tabs.Tab value={`distance`}>Distance</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`angle`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_{target}=Atan2(y_{target}, x_{target})`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`distance`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`r_{target}=\sqrt{x_{target}^2 + y_{target}^2}`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Title order={6}>Step 2.1 - Consider the distance we want our two links to span.</Title>
    <Space h={'xs'} />
    <Text>
      When considering just the distance, this becomes an issue of solving the angles in a triangle,
      where we know all the sides, like in the following image:<br/>
      INSERT IMAGE<br/>
      We can use The Law of Cosines (which you can Google) to determine both of our angles.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`angle1`}>
        <Tabs.List>
          <Tabs.Tab value={`angle1`}>Angle 1</Tabs.Tab>
          <Tabs.Tab value={`angle2`}>Angle 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`angle1`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_1=-acos\left( \frac{-a_2^2 + a_1^2 + r_{target}^2}{2a_{1}r_{target}} \right)`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`angle2`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_2=\pi - acos\left( \frac{-r_{target}^2 + a_1^2 + a_2^2}{2a_{1}a_{2}} \right)`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      Note the Pi in the second angle. This is there because the angle we calculate is not the one we want.
      Try to think about why it isn&apos;t the right one and why subtracting it from Pi (180deg) yields the right result.
    </Text>
    <Space h={'md'} />
    <Title order={6}>Step 2.2 - Consider the angle at which we want our distance to be covered.</Title>
    <Space h={'xs'} />
    <Text>
      Considering the angle only means compensating the first angle.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`angle1`}>
        <Tabs.List>
          <Tabs.Tab value={`angle1`}>Angle 1</Tabs.Tab>
          <Tabs.Tab value={`angle2`}>Angle 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`angle1`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_1=-acos\left( \frac{-a_2^2 + a_1^2 + r_{target}^2}{2a_{1}r_{target}} \right) + \theta_{target}`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`angle2`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_2=-acos\left( \frac{-r_{target}^2 + a_1^2 + a_2^2}{2a_{1}a_{2}} \right) + \pi`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Title order={6}>Step 3 - Determine the last joint angle.</Title>
    <Space h={'xs'} />
    <Text>
      This is easy. We know the first two angles and we know the angle at which we want to end up.
      All we need to do is a simple subtraction.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`angle3`}>
        <Tabs.List>
          <Tabs.Tab value={`angle1`}>Angle 1</Tabs.Tab>
          <Tabs.Tab value={`angle2`}>Angle 2</Tabs.Tab>
          <Tabs.Tab value={`angle3`}>Angle 3</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`angle1`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_1=-acos\left( \frac{-a_2^2 + a_1^2 + r_{target}^2}{2a_{1}r_{target}} \right) + \theta_{target}`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`angle2`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_2=-acos\left( \frac{-r_{target}^2 + a_1^2 + a_2^2}{2a_{1}a_{2}} \right) + \pi`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`angle3`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_3=\theta_Z - \theta_2 - \theta_1`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      These are exactly the equations used in the simulation to calculate the joint angles based on your input.
    </Text>
  </>
}