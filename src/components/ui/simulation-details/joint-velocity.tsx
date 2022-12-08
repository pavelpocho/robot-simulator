import { Accordion, Space, Table, Text, Title } from '@mantine/core';
import React, { useMemo, useState } from 'react';
import { useInputTypeContext } from '../../../utils/contexts/InputTypeContext';
import { useJacobianCodeContext } from '../../../utils/contexts/JacobianCodeContext';
import { useRobotContext } from '../../../utils/contexts/RobotContext';
import { jsMatrixToJax, jsNumberToJax, jsVectorToJax } from '../../../utils/js-to-jax';
import { MathWrapper } from '../math-wrapper';
import { JVApplyingJacobian } from './joint-velocity/applying-jacobian';
import { JVChangingRefFrame } from './joint-velocity/changing-ref-frame';
import { JVEEPosSummaryTable } from './joint-velocity/ee-pos-summary-table';
import { JVEEVelsSummaryTable } from './joint-velocity/ee-vels-summary-table';
import { JVEquationsApplied } from './joint-velocity/equations-applied';
import { JVEquationsUsed } from './joint-velocity/equations-used';
import { JVJacobianTheory } from './joint-velocity/jacobian-theory';
import { JVJointPositionsTable } from './joint-velocity/joint-positions-table';

export const JointVelocitySimDeets = () => {

  const [ value, setValue ] = useState<string[]>([ 'ee-vels-summary-table', 'jp-summary-table', 'ee-pos-summary-table' ]);
  return <div>
    <Accordion variant='separated' multiple value={value} onChange={setValue}>
      <Accordion.Item value='ee-vels-summary-table'>
        <Accordion.Control>Cartesian EE Velocities</Accordion.Control>
        <Accordion.Panel>
          <JVEEVelsSummaryTable />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='jp-summary-table'>
        <Accordion.Control>Joint Positions</Accordion.Control>
        <Accordion.Panel>
          <JVJointPositionsTable />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='ee-pos-summary-table'>
        <Accordion.Control>Cartesian EE Positions</Accordion.Control>
        <Accordion.Panel>
          <JVEEPosSummaryTable />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='jacobian-theory'>
        <Accordion.Control>The Jacobian</Accordion.Control>
        <Accordion.Panel>
          <JVJacobianTheory />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='equations-used'>
        <Accordion.Control>Equations used</Accordion.Control>
        <Accordion.Panel>
          <JVEquationsUsed />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='equations-applied'>
        <Accordion.Control>Step-by-step</Accordion.Control>
        <Accordion.Panel>
          <JVEquationsApplied />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='changing-ref-frame'>
        <Accordion.Control>Changing the Jacobian reference frame</Accordion.Control>
        <Accordion.Panel>
          <JVChangingRefFrame />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='applying-jacobian'>
        <Accordion.Control>Applying the Jacobian</Accordion.Control>
        <Accordion.Panel>
          <JVApplyingJacobian />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  </div>
}