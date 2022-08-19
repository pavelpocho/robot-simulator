import React from "react"
import { Circle } from "react-konva"
import { ScreenSize } from "../../../wrapper"

interface Props {
  x: number,
  y: number,
  screenSize: ScreenSize
}

export const TwoDJoint: React.FC<Props> = ({x, y, screenSize}) => {
  return <>
    <Circle
      height={20}
      width={20}
      stroke={'#777777'}
      fill={'#aaaaaa'}
      strokeWidth={2}
      x={x + (screenSize ? screenSize.x : 0) / 2}
      y={y + (screenSize ? screenSize.y : 0) / 2}
    />
    <Circle
      x={x + (screenSize ? screenSize.x : 0) / 2}
      y={y + (screenSize ? screenSize.y : 0) / 2}
      height={4}
      width={4}
      fill='black'
    />
  </>
}