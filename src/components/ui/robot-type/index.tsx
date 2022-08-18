import React from "react";
import { useRobotContext } from "../../../utils/contexts/RobotContext";

export const RobotTypeUI: React.FC = () => {
  const { robot, setRobot } = useRobotContext();
  return <>
    <div>
      <div>
        <input disabled={false} title="Robot type" value={robot?.type} type="text" onChange={(e) => {
          const typeDiff = e.currentTarget.value.length - robot.type.length;
          const v = e.currentTarget.value;
          setRobot(r => {
            if (typeDiff > 0) {
              const newDhRows = [...Array(typeDiff).keys()].map(i => ({
                i: i + 1 + r.dhTable.length, a_i_minus_1: 0, alpha_i_minus_1: 0, d_i: 0, theta_i: 0 
              }));
              return { ...r, type: v, dhTable: r.dhTable.concat(newDhRows).map(d => ({ ...d })) }
            }
            else {
              return { ...r, type: v, dhTable: r.dhTable.slice(0, typeDiff).map(d => ({ ...d })) }
            }
          });
        }} />
      </div>
    </div>
  </>
}