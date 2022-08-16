import { atan2, MathNumericType } from "mathjs";
import React from "react";
import { Layer, Stage } from "react-konva";
import { MouseCoords, ScreenSize } from "../../App";
import TwoDRobot from "../../robotics/dh-translator";
import { ContextType } from "../../utils/inputTypeContext";
import { TwoDBase } from "../robot/2d-base";
import { TwoDJoint } from "../robot/2d-joint";
import { TwoDLink } from "../robot/2d-link";
import { TwoDPrismaticJoint } from "../robot/2d-prismatic-joint";
import { EndEffector } from "../robot/end-effector";
import { InputType } from "../ui/input-type";

interface Props {
  screenSize: ScreenSize,
  trackMouse: boolean, setTrackMouse: React.Dispatch<React.SetStateAction<boolean>>,
  c: ContextType,
  setMouseCoords: React.Dispatch<React.SetStateAction<MouseCoords | null>>,
  kinematics: (math.Matrix | null | undefined)[],
  robotType: string, robot: TwoDRobot | null
}

const TwoDCanvas = ({ screenSize, trackMouse, setTrackMouse, c, setMouseCoords, kinematics, robotType, robot }: Props) => {
  return (
    <Stage width={screenSize.x - 24} height={screenSize.y - 24} onMouseDown={() => {
      if (c.inputType == InputType.InvKin) setTrackMouse(true);
    }} onMouseUp={() => {
      if (c.inputType == InputType.InvKin) setTrackMouse(false);
      if (c.inputType == InputType.InvKin) setMouseCoords(null);
    }} onMouseMove={(e) => {
      if (trackMouse && c.inputType == InputType.InvKin) {
        setMouseCoords(mc => ({ x: e.evt.pageX, y: e.evt.pageY, prevX: mc?.x ?? 0, prevY: mc?.y ?? 0 }));
      }
    }} style={{
      position: 'fixed',
      borderRight: 'none',
      margin: '10px',
      backgroundColor: '#f1f1f1',
      borderRadius: '8px'
    }}>
      <Layer>
        <TwoDBase x={0} y={0} screenSize={screenSize} />
        { kinematics.map((kin, i) => {
          if (i === kinematics.length - 1) {
            return null;
          }
          if (robotType[i] == 'P') {
            return <TwoDPrismaticJoint screenSize={screenSize} rotationRad={kin ? atan2(
              (kin.toArray()[1] as MathNumericType[])[0] as number,
              (kin.toArray()[0] as MathNumericType[])[0] as number
            ) : 0} length={robot?.getJointValues()[i] ?? 0} key={i} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} />
          }
          else {
            return <TwoDJoint screenSize={screenSize} key={i} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} />
          }
        }) }
        <TwoDLink key={-1} length={robot?.getLinkLengths()[0] ?? 0} x={0} y={0} rotationRad={0} screenSize={screenSize} />
        { kinematics.map((kin, i) => {
          if (i === kinematics.length - 1) {
            return <EndEffector screenSize={screenSize} key={i} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} rotationRad={kin ? atan2(
              (kin.toArray()[1] as MathNumericType[])[0] as number,
              (kin.toArray()[0] as MathNumericType[])[0] as number
            ) : 0} />
          }
          return <TwoDLink screenSize={screenSize} key={i} length={robot?.getLinkLengths()[i + 1] ?? 0} x={kin ? (kin.toArray()[0] as MathNumericType[])[3] as number : 0} y={kin ? (kin.toArray()[1] as MathNumericType[])[3] as number : 0} rotationRad={kin ? atan2(
            (kin.toArray()[1] as MathNumericType[])[0] as number,
            (kin.toArray()[0] as MathNumericType[])[0] as number
          ) : 0} />
        }) }
      </Layer>
    </Stage>
  )
}

export default TwoDCanvas;