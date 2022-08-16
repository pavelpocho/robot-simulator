import React from "react"
import { Circle } from "react-konva"
import { ScreenSize } from "../../../App"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number,
  rotationRad: number,
  screenSize: ScreenSize
}

export const EndEffector: React.FC<Props> = ({x, y, screenSize}) => {
  return <>
    <Circle
      height={10}
      width={10}
      stroke={'#777777'}
      fill={'#F56C7C'}
      strokeWidth={2}
      x={x + (screenSize ? screenSize.x : 0) / 2}
      y={y + (screenSize ? screenSize.y : 0) / 2}
    />
  </>
}