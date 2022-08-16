import React, { useEffect, useRef, useState } from "react";
import { useInputTypeContext } from "../../../utils/inputTypeContext";
import { Input } from "../input";
import { InputType } from "../input-type";

type n = React.Dispatch<React.SetStateAction<number>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  setXDot: n;
  setYDot: n;
  setADot: n;
  setApplyCartesianVelocities: b;
  angular?: boolean;
}

interface MouseCoords {
  x: number,
  y: number,
  ogX: number,
  ogY: number
}

export const JoystickUI: React.FC<Props> = ({
  setXDot, setYDot, setADot, setApplyCartesianVelocities, angular
}) => {

  const joystick = useRef<HTMLDivElement>(null);
  const [tracking, setTracking] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<MouseCoords | null>(null);
  const c = useInputTypeContext();

  useEffect(() => {
    if (angular) {
      setADot(mouseCoords ? (mouseCoords.x - mouseCoords.ogX) / 10 : 0)
    }
    else {
      setXDot(mouseCoords ? (mouseCoords.x - mouseCoords.ogX) * 5 : 0);
      setYDot(mouseCoords ? (mouseCoords.y - mouseCoords.ogY) * 5 : 0); 
    }
    setApplyCartesianVelocities(true);
  }, [mouseCoords]);

  return c.inputType >= 3 ? <div style={{
    borderRadius: '100%',
    backgroundColor: 'gray',
    height: '100px',
    width: '100px',
    position: 'relative',
    display: c.inputType == InputType.CartVel ? 'block' : 'none'
  }}>
    <div ref={joystick} style={{
      borderRadius: '100%',
      backgroundColor: 'black',
      height: '50px',
      width: '50px',
      position: 'absolute',
      left: (mouseCoords ? (mouseCoords.x - mouseCoords.ogX + 25) : 25).toString() + "px",
      top: (angular ? 25 : (mouseCoords ? (mouseCoords.y - mouseCoords.ogY + 25) : 25)).toString() + "px",
    }}
    onMouseDown={(e) => {
      setTracking(true);
      setMouseCoords(mc => ({ x: e.pageX, y: e.pageY, ogX: e.pageX, ogY: e.pageY }));
    }}
    onMouseUp={() => {
      setTracking(false);
      setMouseCoords(null);
    }}
    onMouseMove={(e) => {
      if (tracking) {
        setMouseCoords(mc => ({ x: e.pageX, y: e.pageY, ogX: mc?.ogX ?? 0, ogY: mc?.ogY ?? 0 }));
      }
    }}
    tabIndex={0}
    >
    </div>
  </div> : <></>
}