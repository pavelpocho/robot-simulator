import { Button, List, Tabs, Text } from "@mantine/core";
import { IconCalculator, IconCodePlus, IconListNumbers, IconNumber7, IconNumbers, IconVariable } from "@tabler/icons";
import { MathComponent } from "mathjax-react";
import React, { useState } from "react";

interface Props {
  expandedTex?: string;
  tex?: string;
  supportingTexts?: string[];
  noBorder?: boolean;
  symbolicTex?: string;
  substitutedTex?: string;
  calculatedTex?: string;
}

export const HorScr: React.FC<React.PropsWithChildren> = ({ children }) => <div style={{
  overflowX: 'auto',
  width: '100%',
  position: 'relative'
}}>{children}</div>

export const MathWrapper = ({ noBorder, expandedTex, supportingTexts, tex, symbolicTex, substitutedTex, calculatedTex }: Props) => {

  return <div style={{
    backgroundColor: noBorder ? '' : '#f7f7f7',
    borderRadius: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    padding: noBorder ? '' : '0.5rem 1rem',
    height: 'max-content',
    margin: noBorder ? '0 0' : '0.5rem 0'
  }}>
    { (symbolicTex || substitutedTex || calculatedTex || expandedTex) ? <Tabs defaultValue={symbolicTex ? 'symbolic' : substitutedTex ? 'substituted' : calculatedTex ? 'calculated' : 'expanded'} color={'gray'}>
      <Tabs.List>
        { symbolicTex && <Tabs.Tab value='symbolic' icon={<IconVariable size={14} />}>Symbolic</Tabs.Tab> }
        { expandedTex && <Tabs.Tab value='expanded' icon={<IconNumbers size={14} />}>Expanded</Tabs.Tab> }
        { substitutedTex && <Tabs.Tab value='substituted' icon={<IconListNumbers size={14} />}>Substituted</Tabs.Tab> }
        { calculatedTex && <Tabs.Tab value='calculated' icon={<IconCalculator size={14} />}>Calculated</Tabs.Tab> }
      </Tabs.List>

      { symbolicTex && <HorScr>
        <Tabs.Panel value='symbolic' pt="xs">
          <MathComponent tex={symbolicTex} />
        </Tabs.Panel>
      </HorScr> }

      { expandedTex && <HorScr>
        <Tabs.Panel value='expanded' pt="xs">
            <MathComponent tex={expandedTex} />
        </Tabs.Panel>
      </HorScr> }

      { substitutedTex && <HorScr>
        <Tabs.Panel value='substituted' pt="xs">
          <MathComponent tex={substitutedTex} />
        </Tabs.Panel>
      </HorScr> }

      { calculatedTex && <HorScr>
        <Tabs.Panel value='calculated' pt="xs">
            <MathComponent tex={calculatedTex} />
        </Tabs.Panel>
      </HorScr> }
    </Tabs> : tex ? <>
      <HorScr><MathComponent tex={tex} /></HorScr>
    </> : null }
    <List>
      { supportingTexts && supportingTexts.map((t, i) => <List.Item style={{ paddingLeft: '0.2rem' }} key={i}>{t}</List.Item>) }
    </List>
  </div>;
}