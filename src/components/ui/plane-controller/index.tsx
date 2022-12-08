import { Affix } from "@mantine/core"
import { useEffect, useState } from "react";
import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { useNumbericTMsFrom0ToN } from "../../../utils/hooks/robotHooks"

export const PlaneController = () => {

  const tm = useNumbericTMsFrom0ToN();
  const arr = tm[tm.length - 1]?.toArray();

  const [xC, setXC] = useState<number>(100);
  const [yC, setYC] = useState<number>(100);
  const [tracking, setTracking] = useState<boolean>(false);
  const { setRobot } = useRobotContext();

  useEffect(() => {
    if (tracking) {
      // setRobot(r => {
      //   const arr = r.cartesianEEPositions.map(a => a);
      //   arr.splice(0, 2, (120 - 100) / 10, (120 - 100) / 10);
      //   console.log(arr);
      //   return { ...r, ikUpdate: true, cartesianEEPositions: arr };
      // })
      window.onmousemove = (e: MouseEvent) => {
        setXC(e.offsetX);
        setYC(e.offsetY);
        setRobot(r => {
          const arr = r.cartesianEEPositions.map(a => a);
          arr.splice(0, 2, (e.offsetX - 100) / 10, -(e.offsetY - 100) / 10);
          return { ...r, ikUpdate: true, cartesianEEPositions: arr };
        })
      }
    } else {
      window.onmousemove = null;
    }
  }, [tracking]);

  // Position
  const x = arr != undefined ? (arr[0] as number[])[3] : 0;
  const y = arr != undefined ? (arr[1] as number[])[3] : 0;
  const z = arr != undefined ? (arr[2] as number[])[3] : 0;

  return <Affix position={{ bottom: 50, left: 50 }}>
    <div style={{
      height: '200px',
      width: '200px',
      boxShadow: '0px 0px 12px -6px #00000060',
      backgroundColor: 'white'
    }} >
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 2
      }} onMouseDown={() => {
        setTracking(true);
      }} onMouseUp={() => {
        setTracking(false);
      }}></div>
      <div style={{
        height: '10px',
        width: '10px',
        backgroundColor: 'black',
        transform: `translate(${xC - 5}px, ${yC - 5}px)`
      }}></div>
    </div>
  </Affix>
}