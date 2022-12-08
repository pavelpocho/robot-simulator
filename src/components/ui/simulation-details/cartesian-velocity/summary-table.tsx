import { Table } from "@mantine/core";
import { useRobotContext } from "../../../../utils/contexts/RobotContext";
import { Input } from "../../input";

export const CVSummaryTable = () => {

  const { robot } = useRobotContext();

  return <Table striped={true} border={0} highlightOnHover={true}>
  <tbody>
    <tr>
      {robot.jointVelocities.map((jpx, i) => <td key={i}><Input
        disabled={true}
        label={`Joint ${i+1} Velocity`}
        value={jpx}
        setValue={() => { return null }}
      /></td>)}
    </tr>
  </tbody>
</Table>
};