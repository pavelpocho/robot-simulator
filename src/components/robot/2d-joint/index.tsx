import React from "react"
import { Circle } from "react-konva"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number
}

export const TwoDJoint: React.FC<Props> = ({x, y}) => {
  return <>
    <Circle
      height={20}
      width={20}
      stroke={'black'}
      strokeWidth={2}
      x={x + screenOffsetX}
      y={y + screenOffsetY}
    />
    <Circle x={x + screenOffsetX} y={y + screenOffsetY} height={4} width={4} fill='black' />
  </>
}