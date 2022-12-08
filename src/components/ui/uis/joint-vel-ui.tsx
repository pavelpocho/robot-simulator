import { Select } from '@mantine/core';
import React from 'react';
import { downKeys, upKeys } from '../../../utils/contexts/KeyControlContext';
import { useRobotContext } from '../../../utils/contexts/RobotContext';
import { AR } from '../../../wrapper';
import { Input } from '../input';

export const JointVelUI = () => { 

  const { robot, setRobot } = useRobotContext();

  return <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    { robot?.jointVelocities.map((jvx, i) => (
      <Input 
        key={i}
        step={0.1}
        disabled={false}
        upKey={ upKeys[i] }
        downKey={ downKeys[i] }
        label={`Joint ${i+1} Velocity`}
        value={jvx}
        setValue={(v: number) => {
          setRobot(r => ({ ...r, jointVelocities: r.jointVelocities.map((jV, j) => j === i ? v : jV) }));
        }}
      />
    )) }
    <Select
      label='Angle Representation'
      placeholder='Click to select'
      variant='filled'
      defaultValue={robot.angleRepresentation.toString()}
      onChange={(d) => {
        if (d != null) setRobot(r => ({ ...r, angleRepresentation: parseInt(d) }));
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
}