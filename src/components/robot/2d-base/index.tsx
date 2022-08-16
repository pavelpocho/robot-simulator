import React from "react"
import { Rect } from "react-konva"
import { ScreenSize } from "../../../App"
import { screenOffsetX, screenOffsetY } from "../../../utils/constants"

interface Props {
  x: number,
  y: number,
  screenSize: ScreenSize
}

export const TwoDBase: React.FC<Props> = ({x, y, screenSize}) => {
  return <>
    <Rect
      x={x + (screenSize ? screenSize.x : 0) / 2 - 25}
      y={y + (screenSize ? screenSize.y : 0) / 2 - 15}
      height={30}
      stroke={'#777777'}
      fill={'#cccccc'}
      cornerRadius={8}
      strokeWidth={2}
      width={50}
    />
  </>
}