import React from "react"
import { Rect } from "react-konva"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number,
  length: number,
  rotationRad: number
}

export const TwoDLink: React.FC<Props> = ({x, y, length, rotationRad}) => {
  return <>
    <Rect
      x={x + screenOffsetX}
      y={y + screenOffsetY}
      height={1}
      stroke={'black'}
      strokeWidth={3}
      width={length}
      rotation={rotationRad / Math.PI * 180}
    />
  </>
}