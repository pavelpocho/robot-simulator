import { Accordion } from '@mantine/core';
import { useState } from 'react';
import { CVInvertingJacobian } from './cartesian-velocity/inverting-jacobian';
import { CVSummaryTable } from './cartesian-velocity/summary-table';

export const CartesianVelocitySimDeets = () => { 

  const [ value, setValue ] = useState<string[]>([ 'summary-table' ]);

  return <>
    <Accordion variant='separated' multiple value={value} onChange={setValue}>
      <Accordion.Item value='summary-table'>
        <Accordion.Control>Calculated Joint Velocities</Accordion.Control>
        <Accordion.Panel>
          <CVSummaryTable />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='inverting-jacobian'>
        <Accordion.Control>Inverting the Jacobian</Accordion.Control>
        <Accordion.Panel>
          <CVInvertingJacobian />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
    
  </>
}