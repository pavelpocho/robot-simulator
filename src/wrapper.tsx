import './App.css'
import { useState } from 'react'
import ThreeDCanvas from './components/canvases/3d-canvas'
import { UIWrapper } from './components/ui-wrapper/ui-wrapper'

export interface MouseCoords {
  x: number,
  y: number,
  prevX: number,
  prevY: number
}

export interface ScreenSize {
  x: number,
  y: number
}

const Wrapper = () => {

  const [ screenSize, setScreenSize ] = useState<ScreenSize>({ x: window.innerWidth - 680, y: window.innerHeight });
  window.onresize = () => {
    setScreenSize({ x: window.innerWidth - 680, y: window.innerHeight });
  }

  return (
    <div tabIndex={0} style={{}}>
      <div style={{ position: 'fixed', width: screenSize.x - 24, height: screenSize.y - 24 }}>
        <ThreeDCanvas />
      </div>
      <UIWrapper />
    </div>
  )
}

export default Wrapper
