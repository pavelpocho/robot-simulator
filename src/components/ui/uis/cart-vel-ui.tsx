import React from 'react';
import { DownControlKeys, downKeys, UpControlKeys, upKeys } from '../../../utils/contexts/KeyControlContext';
import { useRobotContext } from '../../../utils/contexts/RobotContext';
import { Input } from '../input';
import { InputType } from '../input-type';

export const CartVelUI = () => {

  const { robot, setRobot } = useRobotContext();

  const cartLabels = [
    'X Velocity',
    'Y Velocity',
    'Z Velocity',
    'X Angle Vel',
    'Y Angle Vel',
    'Z Angle Vel'
  ];

  return <div style={{ display: 'flex', flexWrap: 'wrap' }}>
  { robot.cartesianEEVelocities.map((cvx, i) => (<>
      { i == 3 ? <div style={{
        flexBasis: '100%'
      }}></div> : null }
      <Input 
        key={i}
        step={0.1}
        disabled={false}
        upKey={upKeys[i]}
        downKey={downKeys[i]}
        label={cartLabels[i]}
        value={cvx}
        setValue={(v: number) => {
          setRobot(r => ({ ...r, cartesianEEVelocities: r.cartesianEEVelocities.map((cV, j) => j === i ? v : cV) }));
        }}
      />
    </>
  ))}
</div>
}