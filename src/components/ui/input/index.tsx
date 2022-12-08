import { Flex, NumberInput, Text, Kbd, Space } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons";
import React, { useRef, useState } from "react"
import { useEffect } from "react";
import { DownControlKeys, UpControlKeys, useKCRContext } from "../../../utils/contexts/KeyControlContext";

interface Props {
  label: string;
  value: number | undefined;
  disabled: boolean;
  setValue: React.Dispatch<React.SetStateAction<number>> | ((n: number) => void) | ((n: number, on: number) => number);
  step?: number;
  upKey?: UpControlKeys;
  downKey?: DownControlKeys;
}

export const Input: React.FC<Props> = ({ label, value, setValue, disabled, step, upKey, downKey }) => {

  const { keyControlRegistrations, setKeyControlRegistrations } = useKCRContext();
  const number = useRef<HTMLInputElement>(null);
  const [ oldValue, setOldValue ] = useState<number>(0);

  useEffect(() => {
    
    if (!upKey || !downKey || disabled) return;
    setKeyControlRegistrations(kcr => {
      const prevUp = kcr.findIndex(k => k.key == upKey);
      const prevDown = kcr.findIndex(k => k.key == downKey);
      const newUpKcr = {
        key: upKey,
        action: () => {
          const v = parseFloat(number.current?.value ?? '0') + (step ?? 0);
          setOldValue(setValue(v, oldValue) ?? v);
        }
      }
      const newDownKcr = {
        key: downKey,
        action: () => {
          const v = parseFloat(number.current?.value ?? '0') - (step ?? 0);
          setOldValue(setValue(v, oldValue) ?? v);
        }
      }
      if (prevUp != -1) {
        kcr.splice(prevUp, 1, newUpKcr);
      }
      else {
        kcr.push(newUpKcr)
      }
      if (prevDown != -1) {
        kcr.splice(prevDown, 1, newDownKcr);
      }
      else {
        kcr.push(newDownKcr)
      }
      return kcr.map(k => ({ ...k }));
    });

    return () => {
      setKeyControlRegistrations(kcr => {
        const prevUp = kcr.findIndex(k => k.key == upKey);
        if (prevUp != -1) {
          kcr.splice(prevUp, 1);
        }
        const prevDown = kcr.findIndex(k => k.key == downKey);
        if (prevDown != -1) {
          kcr.splice(prevDown, 1);
        }
        return kcr.map(k => ({ ...k }));
      });
    }
  }, [])

  return <div className='label-wrap' style={{ margin: '0 1rem 0 0' }}>
    { disabled ? 
      <>
        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{label}</label>
        <p className="input-text" style={{ width: 'max-content', paddingRight: '0px', marginTop: '0' }}>{value != undefined ? value.toFixed(3) : ''}</p>
      </> : <>
        <NumberInput
          label={label} 
          style={{
            maxWidth: '10rem',
          }}
          variant='filled'
          precision={2}
          step={step}
          ref={number}
          stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} 
          stepHoldDelay={300}
          onChange={(v) => { if (v != null)
            setOldValue(setValue(v, oldValue) ?? v)
          }}
          value={value}
        />
        { upKey && downKey && <Flex style={{
          marginTop: '0.4rem',
          marginBottom: '1rem',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
          paddingRight: '1rem'
        }}>
          <IconArrowUp height={15}/><Kbd>{upKey}</Kbd>
          <Space w={'sm'} />
          <Kbd>{downKey}</Kbd><IconArrowDown height={15} />
        </Flex> }
      </>
    }
  </div>
}