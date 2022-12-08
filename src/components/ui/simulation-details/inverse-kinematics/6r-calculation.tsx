import { Space, Title, Text, Tabs } from "@mantine/core"
import { HorScr, MathWrapper } from "../../math-wrapper"

export const IK6RCalculation = () => {
  return <>
    <Title order={6}>Removing the last link</Title>
    <Space h={'xs'} />
    <Text>
      Our target coming from the user defines the position of the End Effector. However,
      as previously mentioned, removing the effect of that last joint makes the calculations
      a lot easier. Doing this requires multiplying the length of the last link by a rotation matrix
      representing it&apos;s orientation so that we know which axis to subract it from.
    </Text>
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`offset`}>
        <Tabs.List>
          <Tabs.Tab value={`offset`}>Offset</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`offset`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\left[\begin{array}{ccc} x_{offset} \\ y_{offset} \\ z_{offset} \end{array}\right]=\,_0^{E}R \left[\begin{array}{ccc} a_6 \\ 0 \\ 0 \end{array}\right]`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      From this, we can calculate the X, Y and Z coordinates we will then use as targets.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`t`}>
        <Tabs.List>
          <Tabs.Tab value={`t`}>Offset</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`t`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`P_T = \left[\begin{array}{ccc} x_{user\_target} \\ y_{user\_target} \\ z_{user\_target} \end{array}\right] - \left[\begin{array}{ccc} x_{offset} \\ y_{offset} \\ z_{offset} \end{array}\right]`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Title order={6}>Calculating the first joint</Title>
    <Space h={'xs'} />
    <Text>
      Our target is now defined as X, Y and Z coordinates (Z goes up in this case). Just like in the 3R example,
      these are rather hard to work with. We can simplify the problem by getting rid of X and Y by changing
      them into a distance and an angle (Google: Polar coordinates).
      This is useful because this angle is equal to the angle of the first joint
      and we are only left with solving the distance.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`r`}>
        <Tabs.List>
          <Tabs.Tab value={`r`}>Distance</Tabs.Tab>
          <Tabs.Tab value={`theta`}>Angle</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`r`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`r_{target}=\sqrt{x_{target}^2 + y_{target}^2}`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`theta`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_{target}=Atan2(y_{target}, x_{target})`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Title order={6}>Joints two and three</Title>
    <Space h={'xs'} />
    <Text>
      Remember the plane that was rotating about the origin as we turned the first joint?
      That plane is now defined by the original Z axis and our new &lsquo;R&rsquo; distance.
      If we focus just on it, joints 2 and 3 work just like joints 1 and 2 in the 3R robot,
      except that the coordinates are not called X and Y, but are instead called R and Z.
      The only other difference is that one of the links technically has it&apos;s distance defined
      along a different axis, so one of the &lsquo;a&rsquo;s is now a &lsquo;d&rsquo;.
    </Text>
    <Space h={'xs'} />
    <Text><b>TODO</b>: Add equations from 3R robot. They really aren&apos;t very different :)</Text>
    <Space h={'md'} />
    <Title order={6}>Joints four, five and six</Title>
    <Space h={'xs'} />
    <Text>
      These joints control the angle we want to achieve. In 3D, an angle is not defined by a single number,
      but a 3x3 matrix. This matrix can be represented using many different methods
      (as you can see for yourself with the &lsquo;Angle representation&rsquo; dropdown in the forward kinematics simulation).
      One of these methods is the ZYZ Euler angle method, which describes a rotation by splitting into
      three sections: First rotating about the Z axis, then rotating about the resulting Y axis
      and then finally rotating about the resulting Z axis.
    </Text>
    <Space h={'xs'} />
    <Text>
      If we set our robot up in the right way (like in the default example), we can calculate the ZYZ angles required
      to reach our desired matrix and set the joints to those variables.
      The only catch in this example is that the final free joints do not produce
      a 0deg change when each of them is set to 0, which means an offset has to be applied
      before utilizing this method.
    </Text>
    <Space h={'xs'} />
    <Text>
      Another issue is that we cannot just try to achieve the target angle, we have to first compensate for
      the angle achieved by the first three joints.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`t`}>
        <Tabs.List>
          <Tabs.Tab value={`t`}>Target Matrix</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`t`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
          symbolicTex={String.raw`^{3}_6R_{target}=^{3}_0R\,^{0}_6R\,R_{offset}`}
          // substitutedTex={String.raw`T=1+2`}
          // calculatedTex={String.raw`T=3`}
        /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      We can get the first matrix using forward kinematics for the first
      three joints of the robot and the second matrix is just our input rotation.
      The final matrix is an offset to correct for the wrong orientation of the last
      three joints of this robot.
    </Text>
    <Space h={'xs'} />
    <Text>
      Finally, we can convert the matrix to a ZYZ representation.
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`breakdown`}>
        <Tabs.List>
          <Tabs.Tab value={`breakdown`}>Breakdown</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`breakdown`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`^{3}_6R_{target}=\left[\begin{array}{ccc} r_{11} & r_{12} & r_{13} \\ r_{21} & r_{22} & r_{23} \\ r_{31} & r_{32} & r_{33} \end{array}\right]`}
          // substitutedTex={String.raw`T=1+2`}
          // calculatedTex={String.raw`T=3`}
        /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      For the above, the following is used:
    </Text>
    <Space h={'md'} />
    <HorScr>
      <Tabs orientation='vertical' defaultValue={`y`}>
        <Tabs.List>
          <Tabs.Tab value={`y`}>Y</Tabs.Tab>
          <Tabs.Tab value={`z1`}>Z1</Tabs.Tab>
          <Tabs.Tab value={`z2`}>Z2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`z1`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_{Z1}=Atan2\left(\frac{r_{23}}{sin\theta_{Y}},\frac{r_{13}}{sin\theta_{Y}}\right)`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`y`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_{Y}=Atan2\left(\left(\sqrt{r_{31}^2+r_{32}^2}\right), r_{33}\right)`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      <Tabs.Panel value={`z2`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}><MathWrapper
        symbolicTex={String.raw`\theta_{Z2}=Atan2\left(\frac{r_{32}}{sin\theta_{Y}}, -\frac{r_{31}}{sin\theta_{Y}}\right)`}
        // substitutedTex={String.raw`T=1+2`}
        // calculatedTex={String.raw`T=3`}
      /></Tabs.Panel>
      </Tabs>
    </HorScr>
    <Space h={'md'} />
    <Text>
      And this is how the visualization on the right is done.
    </Text>
    <Space h={'xs'} />
  </>
}