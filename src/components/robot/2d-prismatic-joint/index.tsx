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

export const TwoDPrismaticJoint: React.FC<Props> = ({x, y, length, rotationRad, screenSize}) => {
  return <>
    <Rect
      height={20}
      width={20}
      stroke={'#777777'}
      fill={'#aaaaaa'}
      cornerRadius={[0, 10, 10, 0]}
      strokeWidth={2}
      x={x + sin(rotationRad) * 10 + (screenSize ? screenSize.x : 0) / 2}
      y={y - cos(rotationRad) * 10 + (screenSize ? screenSize.y : 0) / 2}
      rotation={rotationRad / Math.PI * 180}
    />
    <Rect
      height={20}
      width={20}
      stroke={'#777777'}
      fill={'#aaaaaa'}
      cornerRadius={[10, 0, 0, 10]}
      strokeWidth={2}
      x={x + sin(rotationRad) * 10 + (screenSize ? screenSize.x : 0) / 2 - cos(rotationRad) * (length + 20)}
      y={y - cos(rotationRad) * 10 + (screenSize ? screenSize.y : 0) / 2 - sin(rotationRad) * (length + 20)}
      rotation={rotationRad / Math.PI * 180}
    />
    <Rect
      x={x - sin(rotationRad) * 1.5 + (screenSize ? screenSize.x : 0) / 2}
      y={y + cos(rotationRad) * 1.5 + (screenSize ? screenSize.y : 0) / 2}
      height={3}
      width={length}
      stroke={'#777777'}
      strokeWidth={2}
      rotation={rotationRad / Math.PI * 180 - 180}
    />
  </>
}