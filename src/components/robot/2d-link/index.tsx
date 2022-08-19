import { cos, sin } from "mathjs"
import React from "react"
import { Rect } from "react-konva"
import { ScreenSize } from "../../../wrapper"

interface Props {
  x: number,
  y: number,
  length: number,
  rotationRad: number,
  screenSize: ScreenSize
}

export const TwoDLink: React.FC<Props> = ({x, y, length, rotationRad, screenSize}) => {
  return <>
    <Rect
      x={(x + sin(rotationRad) * 0.5) + (screenSize ? screenSize.x : 0) / 2}
      y={(y - cos(rotationRad) * 0.5) + (screenSize ? screenSize.y : 0) / 2}
      height={1}
      cornerRadius={2}
      stroke={'#5476AB'}
      strokeWidth={4}
      width={length}
      rotation={rotationRad / Math.PI * 180}
    />
  </>
}