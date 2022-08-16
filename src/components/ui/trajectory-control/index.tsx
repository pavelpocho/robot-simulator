import React, { useState } from "react";
import { TrajectoryInputType } from "../../../utils/useKinematicInfo";
import { Input } from "../input";

type n = React.Dispatch<React.SetStateAction<number[]>>;
type b = React.Dispatch<React.SetStateAction<boolean>>;

interface Props {
  trajectoryJoint1Values: number[], setTrajectoryJoint1Values: n,
  trajectoryJoint2Values: number[], setTrajectoryJoint2Values: n,
  trajectoryJoint3Values: number[], setTrajectoryJoint3Values: n,
  trajectoryEECartXValues: number[], setTrajectoryEECartXValues: n,
  trajectoryEECartYValues: number[], setTrajectoryEECartYValues: n,
  trajectoryEECartZValues: number[], setTrajectoryEECartZValues: n,
  trajectoryInputType: TrajectoryInputType, setTrajectoryInputType: React.Dispatch<React.SetStateAction<TrajectoryInputType>>,
  setRunCubicTrajectory: b,
  setRunQuinticTrajectory: b
}

export const TrajectoryControlUI: React.FC<Props> = ({
  trajectoryJoint1Values, setTrajectoryJoint1Values,
  trajectoryJoint2Values, setTrajectoryJoint2Values,
  trajectoryJoint3Values, setTrajectoryJoint3Values,
  trajectoryEECartXValues, setTrajectoryEECartXValues,
  trajectoryEECartYValues, setTrajectoryEECartYValues,
  trajectoryEECartZValues, setTrajectoryEECartZValues,
  trajectoryInputType, setTrajectoryInputType,
  setRunCubicTrajectory, setRunQuinticTrajectory
}) => {
  const [counter, setCounter] = useState(0);
  return <>
    <h4>Trajectory points</h4>
    <button onClick={() => {
      setTrajectoryEECartXValues([]); setTrajectoryEECartYValues([]); setTrajectoryEECartZValues([]);
      setTrajectoryInputType(TrajectoryInputType.JointSpace); setCounter(c => c + 1)
    }}>Joint space input</button>
    <button onClick={() => {
      setTrajectoryJoint1Values([]); setTrajectoryJoint2Values([]); setTrajectoryJoint3Values([]);
      setTrajectoryInputType(TrajectoryInputType.CartesianSpace); setCounter(c => c + 1)
    }}>Cartesian space input</button>
    <div>
      { trajectoryInputType == TrajectoryInputType.JointSpace && <><h5 style={{ marginBottom: '4px' }}>Joint 1</h5>
      <div style={{ display: 'flex' }}>
      { trajectoryJoint1Values.map((t, i) => <Input disabled={false} key={i} label={`Joint 1, Point ${i}`} value={t} setValue={(v: number) => {
        setTrajectoryJoint1Values(vals => {
          vals[i] = v;
          return vals;
        });
        setCounter(c => c + 1);
      }} />) }
      </div>
      <h5 style={{ marginBottom: '4px' }}>Joint 2</h5>
      <div style={{ display: 'flex' }}>
      { trajectoryJoint2Values.map((t, i) => <Input disabled={false} key={i} label={`Joint 2, Point ${i}`} value={t} setValue={(v: number) => {
        setTrajectoryJoint2Values(vals => {
          vals[i] = v;
          return vals;
        });
        setCounter(c => c + 1);
      }} />) }
      </div>
      <h5 style={{ marginBottom: '4px' }}>Joint 3</h5>
      <div style={{ display: 'flex' }}>
      { trajectoryJoint3Values.map((t, i) => <Input disabled={false} key={i} label={`Joint 3, Point ${i}`} value={t} setValue={(v: number) => {
        setTrajectoryJoint3Values(vals => {
          vals[i] = v;
          return vals;
        });
        setCounter(c => c + 1);
      }} />) }
      </div>
      <button key={'joint'} onClick={() => {
        const ogLength = trajectoryJoint1Values.length;
        setTrajectoryJoint1Values(v => {
          if (v.length != ogLength) {
            return v;
          }
          v.push(0);
          return v;
        });
        setTrajectoryJoint2Values(v => {
          if (v.length != ogLength) {
            return v;
          }
          v.push(0);
          return v;
        });
        setTrajectoryJoint3Values(v => {
          if (v.length != ogLength) {
            return v;
          }
          v.push(0);
          return v;
        });
        setCounter(c => c + 1);
      }}>Add point to joints</button></>}
      {trajectoryInputType == TrajectoryInputType.CartesianSpace && <><h5 style={{ marginBottom: '4px' }}>Cartesian X EE Values</h5>
      <div style={{ display: 'flex' }}>
      { trajectoryEECartXValues.map((t, i) => <Input disabled={false} key={i} label={`Cartesian X EE, Point ${i}`} value={t} setValue={(v: number) => {
        setTrajectoryEECartXValues(vals => {
          vals[i] = v;
          return vals;
        });
        setCounter(c => c + 1);
      }} />) }
      </div>
      <h5 style={{ marginBottom: '4px' }}>Cartesian Y EE Values</h5>
      <div style={{ display: 'flex' }}>
      { trajectoryEECartYValues.map((t, i) => <Input disabled={false} key={i} label={`Cartesian Y EE, Point ${i}`} value={t} setValue={(v: number) => {
        setTrajectoryEECartYValues(vals => {
          vals[i] = v;
          return vals;
        });
        setCounter(c => c + 1);
      }} />) }
      </div>
      <h5 style={{ marginBottom: '4px' }}>Cartesian Z EE Values</h5>
      <div style={{ display: 'flex' }}>
      { trajectoryEECartZValues.map((t, i) => <Input disabled={false} key={i} label={`Cartesian Z EE, Point ${i}`} value={t} setValue={(v: number) => {
        setTrajectoryEECartZValues(vals => {
          vals[i] = v;
          return vals;
        });
        setCounter(c => c + 1);
      }} />) }
      </div>
      <button key={'cart'} onClick={() => {
        const ogLength = trajectoryEECartXValues.length;
        setTrajectoryEECartXValues(v => {
          if (v.length != ogLength) {
            return v;
          }
          v.push(0);
          return v;
        });
        setTrajectoryEECartYValues(v => {
          if (v.length != ogLength) {
            return v;
          }
          v.push(0);
          return v;
        });
        setTrajectoryEECartZValues(v => {
          if (v.length != ogLength) {
            return v;
          }
          v.push(0);
          return v;
        });
        setCounter(c => c + 1);
      }}>Add point to cart positions</button></>}
    </div>
    <h4>Execute a trajectory</h4>
    <h5>Joint-space</h5>
    { ((trajectoryJoint1Values.length >= 2 && 
      trajectoryJoint1Values.length <= 3) || 
      (trajectoryEECartXValues.length >= 2 &&
      trajectoryEECartXValues.length <= 3)) && <>
      <button onClick={() => {setRunCubicTrajectory(true)}}>Cubic</button>
      <button onClick={() => {setRunQuinticTrajectory(true)}}>Quintic</button>
    </> }
    { (trajectoryJoint1Values.length >= 2 || trajectoryEECartXValues.length >= 2) && <button>Linear w/ parabolic blends</button> }
    <h5>Cartesian-space (straight line)</h5>
    <button>IK-based</button>
    <button>Inverse-jacobian-based</button>
  </>
}