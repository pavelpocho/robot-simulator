import { Table } from "@mantine/core";
import { useRobotContext } from "../../../../utils/contexts/RobotContext";
import { AR } from "../../../../wrapper";
import { Input } from "../../input";

export const FKSummaryTable = () => {

  const { robot } = useRobotContext();
  const ar = robot.angleRepresentation;

  const cartLabels = [
    'X Position',
    'Y Position',
    'Z Position',
    ar == AR.XYZFixed ? 'X Angle' : (ar == AR.ZYXEuler || ar == AR.ZYZEuler) ? 'Z Angle' : ar == AR.EqAnAx ? 'Angle' : 'Eta',
    (ar == AR.XYZFixed || ar == AR.ZYXEuler || ar == AR.ZYZEuler) ? 'Y Angle' : ar == AR.EqAnAx ? 'Axis X Part' : 'Epsilon X',
    (ar == AR.XYZFixed || ar == AR.ZYZEuler) ? 'Z Angle' : ar == AR.ZYXEuler ? 'X Angle' : ar == AR.EulerParams ? 'Epsilon Y' : 'Axis Y Part',
    ar == AR.EulerParams ? 'Epsilon Z' : ar == AR.EqAnAx ? 'Axis Z Part' : ''
  ];

  return <Table striped={true} border={0} highlightOnHover={true}>
    <tbody>
      <tr>
        {(robot.cartesianEEPositions.slice(0, 3) as (number | undefined)[]).concat(ar == AR.EulerParams || ar == AR.EqAnAx ? [ undefined ] : []).map((cpx, i) => <td key={i}><Input
          disabled={true}
          label={i == 3 ? '' : cartLabels[i]}
          value={cpx}
          setValue={() => { return null }}
        /></td>)}
      </tr>
      <tr>
        {robot.cartesianEEPositions.slice(3, ar == AR.EulerParams || ar == AR.EqAnAx ? 7 : 6).map((cpx, i) => <td key={i}><Input
          disabled={true}
          label={cartLabels[i + 3]}
          value={cpx}
          setValue={() => { return null }}
        /></td>)}
      </tr>
    </tbody>
  </Table>
}