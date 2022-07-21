import React from "react"
import { Circle } from "react-konva"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number,
  rotationRad: number
}

export const EndEffector: React.FC<Props> = ({x, y}) => {
  return <>
    <Circle
      height={10}
      width={10}
      stroke={'red'}
      strokeWidth={2}
      x={x + screenOffsetX}
      y={y + screenOffsetY}
    />
  </>
}