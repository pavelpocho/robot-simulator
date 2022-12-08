import { Table } from "@mantine/core"
import { useRobotContext } from "../../../../utils/contexts/RobotContext"
import { Input } from "../../input";

export const JVEEVelsSummaryTable = () => {

  const { robot } = useRobotContext();

  const cartVelocityLabels = [
    'X Velocity',
    'Y Velocity',
    'Z Velocity',
    'X Angle Vel',
    'Y Angle Vel',
    'Z Angle Vel'
  ];

  return <Table striped={true} border={0} highlightOnHover={true}>
  <tbody>
    <tr>
      {robot.cartesianEEVelocities.slice(0, 3).map((cpx, i) => <td key={i}><Input
        disabled={true}
        label={cartVelocityLabels[i]}
        value={cpx}
        setValue={() => { return null }}
      /></td>)}
    </tr>
    <tr>
      {robot.cartesianEEVelocities.slice(3, 6).map((cpx, i) => <td key={i}><Input
        disabled={true}
        label={cartVelocityLabels[i + 3]}
        value={cpx}
        setValue={() => { return null }}
      /></td>)}
    </tr>
  </tbody>
</Table>
}