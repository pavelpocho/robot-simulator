import { Table } from "@mantine/core";
import { useState } from "react";
import { useRobotContext } from "../../../../utils/contexts/RobotContext";
import { AR } from "../../../../wrapper";
import { Input } from "../../input";

export const IKSummaryTable = () => {

  const { robot } = useRobotContext();

  return <Table striped={true} border={0} highlightOnHover={true}>
    <tbody>
      {
        [...Array(Math.ceil(robot?.jointPositions.length / 3)).keys()].map((j) => <tr key={j}>
          { robot?.jointPositions.slice(j * 3, j * 3 + 3).map((jpx, i) => (<td key={i}>
            <Input 
              key={i}
              step={robot.type[i] === 'P' ? 0.2 : 0.02}
              disabled={ true }
              label={`Joint ${j * 3 + i + 1} Position`}
              value={jpx}
              setValue={() => {
                return null
              }}
            /></td>
          )) }
        </tr>)
      }
    </tbody>
  </Table>
}