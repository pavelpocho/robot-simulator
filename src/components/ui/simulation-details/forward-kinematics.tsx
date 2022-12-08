import { Accordion } from "@mantine/core";
import { useState } from "react";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { FKAngleExplanation } from "./forward-kinematics/angle-explanation";
import { FKDescription } from "./forward-kinematics/description";
import { FKDetailExplanation } from "./forward-kinematics/detail-explanation";
import { FKSummaryTable } from "./forward-kinematics/summary-table";

export const ForwardKinematicsSimulationDetails = () => {

  const { robot } = useRobotContext();
  const ar = robot.angleRepresentation;

  const [value, setValue] = useState<string[]>([ 'summary-table' ]);

  return <div>
    <Accordion variant='separated' multiple value={value} onChange={setValue}>
      <Accordion.Item value='summary-table'>
        <Accordion.Control>Calculated Cartesian positions</Accordion.Control>
        <Accordion.Panel>
          <FKSummaryTable />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='description'>
        <Accordion.Control>What is Forward kinematics?</Accordion.Control>
        <Accordion.Panel>
          <FKDescription />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='detail-explanation'>
        <Accordion.Control>What does this simulation show?</Accordion.Control>
        <Accordion.Panel>
          <FKDetailExplanation />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='angle-explanation'>
        <Accordion.Control>Angle representation</Accordion.Control>
        <Accordion.Panel>
          <FKAngleExplanation />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  </div>

}