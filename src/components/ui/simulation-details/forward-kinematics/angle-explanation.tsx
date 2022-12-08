import { Text } from '@mantine/core';
import { useRobotContext } from '../../../../utils/contexts/RobotContext';
import { AR } from '../../../../wrapper';
import { EqAnAxAngleDetail, EulerParametersAngleDetail, XYZFixedAngleDetail, ZYXEulerAngleDetail, ZYZEulerAngleDetail } from '../../angle-representation-details';

export const FKAngleExplanation = () => {

  const { robot } = useRobotContext();
  const ar = robot.angleRepresentation;

  const arLabels = [
    { value: AR.XYZFixed, label: 'XYZ Fixed' },
    { value: AR.ZYXEuler, label: 'ZYX Cardano' },
    { value: AR.ZYZEuler, label: 'ZYZ Euler' },
    { value: AR.EqAnAx, label: 'Equivalent Angle Axis' },
    { value: AR.EulerParams, label: 'Euler Parameters' },
  ];

  return <>
    <Text>
      A rotation in 3D space can be represented in many different ways.
      The most objective way is a Rotation Matrix, but these are not very intuitive for humans.
      You have picked the {arLabels.find(a => a.value == ar)?.label} angle representation in the simulation input, which is calculated from a transformation matrix as follows:
    </Text>
    { ar === AR.XYZFixed && <XYZFixedAngleDetail robot={robot} /> }
    { ar === AR.ZYXEuler && <ZYXEulerAngleDetail robot={robot} /> }
    { ar === AR.ZYZEuler && <ZYZEulerAngleDetail robot={robot} /> }
    { ar === AR.EqAnAx && <EqAnAxAngleDetail robot={robot} /> }
    { ar === AR.EulerParams && <EulerParametersAngleDetail robot={robot} /> }
  </>
};