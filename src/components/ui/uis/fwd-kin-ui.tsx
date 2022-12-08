import { Select, Space, Title } from '@mantine/core';
import React from 'react';
import { useInputTypeContext } from '../../../utils/contexts/InputTypeContext';
import { downKeys, upKeys } from '../../../utils/contexts/KeyControlContext';
import { useRobotContext } from '../../../utils/contexts/RobotContext';
import { AR } from '../../../wrapper';
import { Input } from '../input';
import { InputType } from '../input-type';

export const FwdKinUI = () => { 

  const { robot, setRobot } = useRobotContext();
  const { inputType } = useInputTypeContext();

  return <>
    <Space h={'sm'} />
    <Title order={6}>Joint Positions & Angle Representation</Title>
    <Space h={'xs'} />
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      { robot?.jointPositions.map((jpx, i) => (
        <Input 
          key={i}
          step={robot.type[i] === 'P' ? 0.2 : 0.02}
          disabled={inputType != InputType.FwdKin}
          label={`Joint ${i+1} Position`}
          value={jpx}
          upKey={ upKeys[i] }
          downKey={ downKeys[i] }
          setValue={(n: number, on: number) => {
            setRobot(r => ({ ...r, fkUpdate: true, jointPositions: r.jointPositions.map((jp, j) => j === i ? (
              (robot.type[i] === 'P' && on >= 0.59 && n < 0.6) ? -0.6 : 
              (robot.type[i] === 'P' && on <= -0.59 && n > -0.6) ? 0.6 : 
              n
            ) : jp) }))
            return (
              (robot.type[i] === 'P' && on >= 0.59 && n < 0.6) ? -0.6 : 
              (robot.type[i] === 'P' && on <= -0.59 && n > -0.6) ? 0.6 : 
              n
            )
          }}
        />
      )) }
      <Select
        label='Angle Representation'
        placeholder='Click to select'
        variant='filled'
        defaultValue={robot.angleRepresentation.toString()}
        onChange={(d) => {
          if (d != null) {
            setRobot(r => ({ ...r, angleRepresentation: parseInt(d), fkUpdate: true }));
          }
        }}
        data={[
          { value: AR.XYZFixed.toString(), label: 'XYZ Fixed' },
          { value: AR.ZYXEuler.toString(), label: 'ZYX Cardano' },
          { value: AR.ZYZEuler.toString(), label: 'ZYZ Euler' },
          { value: AR.EqAnAx.toString(), label: 'Equivalent Angle Axis' },
          { value: AR.EulerParams.toString(), label: 'Euler Parameters' },
        ]}
      />
    </div>
  </>
}