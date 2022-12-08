import { Accordion } from '@mantine/core';
import React, { useState } from 'react';
import { useRobotContext } from '../../../utils/contexts/RobotContext';
import { IK3RCalculation } from './inverse-kinematics/3r-calculation';
import { IK3RMethod } from './inverse-kinematics/3r-method';
import { IK3RRationale } from './inverse-kinematics/3r-rationale';
import { IK6RCalculation } from './inverse-kinematics/6r-calculation';
import { IK6RRationale } from './inverse-kinematics/6r-rationale';
import { IKSummaryTable } from './inverse-kinematics/summary-table';

export const InverseKinematicsSimDeets = () => {

  const [ value, setValue ] = useState<string[]>([ 'summary-table' ]);
  const { robot } = useRobotContext();

  return <Accordion variant='separated' multiple value={value} onChange={setValue}>
    <Accordion.Item value='summary-table'>
      <Accordion.Control>Calculated Cartesian positions</Accordion.Control>
      <Accordion.Panel>
        <IKSummaryTable />
      </Accordion.Panel>
    </Accordion.Item>
    { robot.type === 'RRRE' ? <>
      <Accordion.Item value='3r-rationale'>
        <Accordion.Control>Explanation</Accordion.Control>
        <Accordion.Panel>
          <IK3RRationale />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='3r-method'>
        <Accordion.Control>3R Method</Accordion.Control>
        <Accordion.Panel>
          <IK3RMethod />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='3r-calculation'>
        <Accordion.Control>3R Calculation</Accordion.Control>
        <Accordion.Panel>
          <IK3RCalculation />
        </Accordion.Panel>
      </Accordion.Item>
    </> : <>
      <Accordion.Item value='6r-rationale'>
        <Accordion.Control>Explanation</Accordion.Control>
        <Accordion.Panel>
          <IK6RRationale />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='6r-method'>
        <Accordion.Control>6R Method</Accordion.Control>
        <Accordion.Panel>
          <IK6RRationale />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='6r-calculation'>
        <Accordion.Control>6R Calculation</Accordion.Control>
        <Accordion.Panel>
          <IK6RCalculation />
        </Accordion.Panel>
      </Accordion.Item>
    </> }
  </Accordion>
}