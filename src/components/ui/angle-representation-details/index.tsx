import { Robot } from "../../../utils/contexts/RobotContext";
import { getNumbericTMsFrom0ToN } from "../../../utils/hooks/robotHooks";
import { MathWrapper } from "../math-wrapper";
import { Space, Tabs, Text } from '@mantine/core';

export const XYZFixedAngleDetail = ({ robot }: { robot: Robot }) => {
  const tm = getNumbericTMsFrom0ToN(robot).slice(-1)[0]?.toArray() as number[][];
  return <>
    <Space h={'md'} />
    <div style={{
      overflowX: 'auto',
      width: '100%',
      position: 'relative'
    }}>
      <Tabs orientation='vertical' defaultValue={`beta`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          <Tabs.Tab value={`beta`}>Beta</Tabs.Tab>
          <Tabs.Tab value={`alpha`}>Alpha</Tabs.Tab>
          <Tabs.Tab value={`gamma`}>Gamma</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`beta`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\beta=Atan2\left(-r_{31}, \sqrt{r^2_{11}+r^2_{21}}\right)`}
            substitutedTex={String.raw`\beta=Atan2\left(-${tm[2][0].toFixed(3)}, \sqrt{${tm[0][0].toFixed(3)}^2+${tm[1][0].toFixed(3)}^2}\right)`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`gamma`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            substitutedTex={String.raw`\alpha=Atan2\left(\frac{${tm[1][0].toFixed()}}{cos\beta},\frac{${tm[0][0].toFixed()}}{cos\beta}\right)`}
            symbolicTex={String.raw`\alpha=Atan2\left(\frac{r_{21}}{cos\beta},\frac{r_{11}}{cos\beta}\right)`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`alpha`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper 
            substitutedTex={String.raw`\gamma=Atan2\left(\frac{${tm[2][1].toFixed()}}{cos\beta},\frac{${tm[2][2].toFixed()}}{cos\beta}\right)`}
            symbolicTex={String.raw`\gamma=Atan2\left(\frac{r_{32}}{cos\beta},\frac{r_{33}}{cos\beta}\right)`}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
    <Space h={'md'} />
    <Text>These angles are then used in the table above.</Text>
    <Text>
      You might notice these formulas are the same as the ZYX Cardano angles.
      This rule extends to all reverse combinations of Euler and Fixed angles.
      So XYZ Fixed = ZYX Cardano, ZYX Fixed = XYZ Euler, XZY Fixed = YZX Euler and so on..
    </Text>
  </>
}

export const ZYXEulerAngleDetail = ({ robot }: { robot: Robot }) => {
  const tm = getNumbericTMsFrom0ToN(robot).slice(-1)[0]?.toArray() as number[][];
  return <>
    <Space h={'md'} />
    <div style={{
      overflowX: 'auto',
      width: '100%',
      position: 'relative'
    }}>
      <Tabs orientation='vertical' defaultValue={`beta`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          <Tabs.Tab value={`beta`}>Beta</Tabs.Tab>
          <Tabs.Tab value={`alpha`}>Alpha</Tabs.Tab>
          <Tabs.Tab value={`gamma`}>Gamma</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`beta`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\beta=Atan2\left(-r_{31}, \sqrt{r^2_{11}+r^2_{21}}\right)`}
            substitutedTex={String.raw`\beta=Atan2\left(-${tm[2][0].toFixed(3)}, \sqrt{${tm[0][0].toFixed(3)}^2+${tm[1][0].toFixed(3)}^2}\right)`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`alpha`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            substitutedTex={String.raw`\alpha=Atan2\left(\frac{${tm[1][0].toFixed()}}{cos\beta},\frac{${tm[0][0].toFixed()}}{cos\beta}\right)`}
            symbolicTex={String.raw`\alpha=Atan2\left(\frac{r_{21}}{cos\beta},\frac{r_{11}}{cos\beta}\right)`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`gamma`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper 
            substitutedTex={String.raw`\gamma=Atan2\left(\frac{${tm[2][1].toFixed()}}{cos\beta},\frac{${tm[2][2].toFixed()}}{cos\beta}\right)`}
            symbolicTex={String.raw`\gamma=Atan2\left(\frac{r_{32}}{cos\beta},\frac{r_{33}}{cos\beta}\right)`}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
    <Space h={'md'} />
    <Text>These angles are then used in the table above.</Text>
    <Text>
      You might notice these formulas are the same as the XYZ Fixed angles.
      This rule extends to all reverse combinations of Euler and Fixed angles.
      So XYZ Fixed = ZYX Cardano, ZYX Fixed = XYZ Euler, XZY Fixed = YZX Euler and so on..
    </Text>
  </>
}

export const ZYZEulerAngleDetail = ({ robot }: { robot: Robot }) => {
  const tm = getNumbericTMsFrom0ToN(robot).slice(-1)[0]?.toArray() as number[][];
  return <>
    <Space h={'md'} />
    <div style={{
      overflowX: 'auto',
      width: '100%',
      position: 'relative'
    }}>
      <Tabs orientation='vertical' defaultValue={`beta`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          <Tabs.Tab value={`beta`}>Beta</Tabs.Tab>
          <Tabs.Tab value={`alpha`}>Alpha</Tabs.Tab>
          <Tabs.Tab value={`gamma`}>Gamma</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`beta`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\beta=Atan2\left(\sqrt{r^2_{31}+r^2_{32}},r_{33}\right)`}
            substitutedTex={String.raw`\beta=Atan2\left(\sqrt{${tm[2][0].toFixed(3)}^2+${tm[2][1].toFixed(3)}^2},${tm[2][2].toFixed(3)}\right)`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`alpha`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\alpha=Atan2\left(\frac{r_{23}}{sin\beta},\frac{r_{13}}{sin\beta}\right)`}
            substitutedTex={String.raw`\alpha=Atan2\left(\frac{${tm[1][2].toFixed(3)}}{sin\beta},\frac{${tm[0][2].toFixed(3)}}{sin\beta}\right)`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`gamma`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\gamma=Atan2\left(\frac{r_{32}}{sin\beta},-\frac{r_{31}}{sin\beta}\right)`}
            substitutedTex={String.raw`\gamma=Atan2\left(\frac{${tm[2][1].toFixed(3)}}{sin\beta},-\frac{${tm[1][0].toFixed(3)}}{sin\beta}\right)`}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
    <Space h={'md'} />
    <Text>
      Euler angle representations can be done over the {`'same'`} axis twice, because the axis
      rotate with the model, so the {`'Z'`} axis at the end is technically different from the first one.
    </Text>
  </>
}

export const EqAnAxAngleDetail = ({ robot }: { robot: Robot }) => {
  const tm = getNumbericTMsFrom0ToN(robot).slice(-1)[0]?.toArray() as number[][];
  return <>
    <Space h={'md'} />
    <div style={{
      overflowX: 'auto',
      width: '100%',
      position: 'relative'
    }}>
      <Tabs orientation='vertical' defaultValue={`costheta`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          <Tabs.Tab value={`costheta`}>Cos Theta</Tabs.Tab>
          <Tabs.Tab value={`khat`}>K Hat</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`costheta`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`cos\theta=\frac{r_{11}+r_{22}+r_{33}-1}{2}`}
            substitutedTex={String.raw`cos\theta=\frac{${tm[0][0].toFixed(3)}+${tm[1][1].toFixed(3)}+${tm[2][2].toFixed(3)}-1}{2}`} 
          />
        </Tabs.Panel>
        <Tabs.Panel value={`khat`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`^A{\hat{K}}=\frac{1}{2sin\theta}\left[ \begin{array}{ccc} r_{32}-r_{23} \\ r_{13}-r_{31} \\ r_{21}-r_{12} \end{array} \right]`}
            substitutedTex={String.raw`^A{\hat{K}}=\frac{1}{2sin\theta}\left[ \begin{array}{ccc} ${tm[2][1].toFixed(3)}-${tm[1][2].toFixed(3)} \\ ${tm[0][2].toFixed(3)}-${tm[2][0].toFixed(3)} \\ ${tm[1][0].toFixed(3)}-${tm[0][1].toFixed(3)} \end{array} \right]`}      
          />
        </Tabs.Panel>
      </Tabs>
    </div>
    <Space h={'md'} />
    <Text>
      This method of representing angle shows it as a rotation around a single axis, which is a
      combination of all of the three principal axes.
    </Text>
  </>
}

export const EulerParametersAngleDetail = ({ robot }: { robot: Robot }) => {
  const tm = getNumbericTMsFrom0ToN(robot).slice(-1)[0]?.toArray() as number[][];
  return <>
    <Space h={'md'} />
    <div style={{
      overflowX: 'auto',
      width: '100%',
      position: 'relative'
    }}>
      <Tabs orientation='vertical' defaultValue={`eta`} style={{
        // alignItems: 'center',
        // padding: '0.5rem'
      }}>
        <Tabs.List>
          <Tabs.Tab value={`eta`}>Eta</Tabs.Tab>
          <Tabs.Tab value={`epsilon_x`}>Epsilon X</Tabs.Tab>
          <Tabs.Tab value={`epsilon_y`}>Epsilon Y</Tabs.Tab>
          <Tabs.Tab value={`epsilon_z`}>Epsilon Z</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={`eta`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\eta=\frac{1}{2}\sqrt{1+r_{11}+r_{22}+r_{33}}`}
            substitutedTex={String.raw`\eta=\frac{1}{2}\sqrt{1+${tm[0][0].toFixed(3)}+${tm[1][1].toFixed(3)}+${tm[2][2].toFixed(3)}}`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`epsilon_x`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\epsilon_x=\frac{r_{32}-r_{23}}{4\eta}`}
            substitutedTex={String.raw`\epsilon_x=\frac{${tm[2][1].toFixed(3)}-${tm[1][2].toFixed(3)}}{4\eta}`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`epsilon_y`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\epsilon_y=\frac{r_{13}-r_{31}}{4\eta}`}
            substitutedTex={String.raw`\epsilon_y=\frac{${tm[0][2].toFixed(3)}-${tm[2][0].toFixed(3)}}{4\eta}`}
          />
        </Tabs.Panel>
        <Tabs.Panel value={`epsilon_z`} style={{
          alignItems: 'center',
          padding: '0.5rem'
        }}>
          <MathWrapper
            symbolicTex={String.raw`\epsilon_z=\frac{r_{21}-r_{12}}{4\eta}`}
            substitutedTex={String.raw`\epsilon_z=\frac{${tm[1][0].toFixed(3)}-${tm[0][1].toFixed(3)}}{4\eta}`}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
    <Space h={'md'} />
    <Text>
      This method has the advantage of avoiding singularities where two axis match up.
    </Text>
  </>
}