import { Table } from "@mantine/core"
import { useRobotContext } from "../../../../utils/contexts/RobotContext"
import { Input } from "../../input";

export const JVJointPositionsTable = () => {

  const { robot } = useRobotContext();

  return <Table striped={true} border={0} highlightOnHover={true}>
    <tbody>
      <tr>{ robot?.jointPositions.map((jpx, i) => (
        <td key={i}><Input 
          
          step={robot.type[i] === 'P' ? 0.2 : 0.02}
          disabled={true}
          label={`Joint ${i+1} Position`}
          value={jpx}
          setValue={() => {
            return null
          }}
        /></td>
      )) }</tr>
    </tbody>
  </Table>;
};