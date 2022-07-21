import { cos, sin } from "mathjs"
import React from "react"
import { Rect } from "react-konva"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number,
  length: number,
  rotationRad: number
}

export const TwoDPrismaticJoint: React.FC<Props> = ({x, y, length, rotationRad}) => {
  return <>
    <Rect
      height={5}
      width={5}
      stroke={'black'}
      strokeWidth={2}
      x={x + screenOffsetX - 2.5}
      y={y + screenOffsetY - 2.5}
      rotation={rotationRad / Math.PI * 180}
    />
    <Rect
      height={5}
      width={5}
      stroke={'black'}
      strokeWidth={2}
      x={x + screenOffsetX - 2.5 - cos(rotationRad) * length}
      y={y + screenOffsetY - 2.5 - sin(rotationRad) * length}
      rotation={rotationRad / Math.PI * 180}
    />
    <Rect x={x + screenOffsetX} y={y + screenOffsetY} height={3} width={length} stroke={'black'} strokeWidth={2} rotation={rotationRad / Math.PI * 180 - 180} />
  </>
}