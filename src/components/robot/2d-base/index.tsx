import React from "react"
import { Rect } from "react-konva"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number
}

export const TwoDBase: React.FC<Props> = ({x, y }) => {
  return <>
    <Rect
      x={x + screenOffsetX - 25}
      y={y + screenOffsetY - 15}
      height={30}
      stroke={'black'}
      strokeWidth={5}
      width={50}
    />
  </>
}