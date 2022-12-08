import { Select, Space, Title } from '@mantine/core';
import React, { useEffect } from 'react';
import { useInputTypeContext } from '../../../utils/contexts/InputTypeContext';
import { upKeys, downKeys } from '../../../utils/contexts/KeyControlContext';
import { useRobotContext } from '../../../utils/contexts/RobotContext';
import { AR } from '../../../wrapper';
import { Input } from '../input';
import { InputType } from '../input-type';

export const InvKinUI = () => { 

  const { robot, setRobot } = useRobotContext();
  const { inputType } = useInputTypeContext();
  const ar = robot.angleRepresentation;
  
  const cartLabels = [
    'X Position',
    'Y Position',
    'Z Position',
    ar == AR.XYZFixed ? 'X Angle' : (ar == AR.ZYXEuler || ar == AR.ZYZEuler) ? 'Z Angle' : ar == AR.EqAnAx ? 'Angle' : 'e1',
    (ar == AR.XYZFixed || ar == AR.ZYXEuler || ar == AR.ZYZEuler) ? 'Y Angle' : ar == AR.EqAnAx ? 'Axis X Part' : 'e2',
    (ar == AR.XYZFixed || ar == AR.ZYZEuler) ? 'Z Angle' : ar == AR.ZYXEuler ? 'X Angle' : ar == AR.EulerParams ? 'e3' : 'Axis Y Part',
    ar == AR.EulerParams ? 'e4' : ar == AR.EqAnAx ? 'Axis Z Part' : ''
  ];

  return <>
    <Space h={'sm'} />
    <Title order={6}>Angle representation</Title>
    <Space h={'xs'} />
    { robot.type === 'RRRRRRE' && <Select
      label='Angle Representation'
      placeholder='Click to select'
      variant='filled'
      style={{
        maxWidth: '335px',
      }}
      defaultValue={robot.angleRepresentation.toString()}
      onChange={(d) => {
        if (d != null) {
          setRobot(r => ({ ...r, angleRepresentation: parseInt(d), ikUpdate: true }));
        }
      }}
      data={[
        { value: AR.XYZFixed.toString(), label: 'XYZ Fixed' },
        { value: AR.ZYXEuler.toString(), label: 'ZYX Cardano' },
        { value: AR.ZYZEuler.toString(), label: 'ZYZ Euler' },
        { value: AR.EqAnAx.toString(), label: 'Equivalent Angle Axis' },
        { value: AR.EulerParams.toString(), label: 'Euler Parameters' },
      ]}
    /> }
    <Space h={'sm'} />
    <Title order={6}>Joint Positions</Title>
    <Space h={'xs'} />
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      { robot?.cartesianEEPositions.map((cpx, i) => cartLabels[i] !== '' && <Input 
        key={i}
        upKey={ upKeys[i] }
        downKey={ downKeys[i] }
        disabled={inputType != InputType.InvKin}
        label={cartLabels[i]}
        value={cpx}
        step={ i > 2 ? 0.02 : 0.2 }
        setValue={(v: number) => {
          setRobot(r => ({ ...r, ikUpdate: true, cartesianEEPositions: r.cartesianEEPositions.map((cp, j) => j === i ? v : cp) }))
        }}
      />)}
    </div>
  </>
}