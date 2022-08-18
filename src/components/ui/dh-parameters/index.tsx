import { useRobotContext } from "../../../utils/contexts/RobotContext";
import { useNumberOfJoints } from "../../../utils/hooks/robotHooks";

export const DHParametersUI = () => {
  const { robot, setRobot } = useRobotContext();
  return <>
    <div>
      <table><tbody>{
        [...Array((useNumberOfJoints() ?? 0) + 1).keys()].map(i => <tr key={i + 1}>
          <td>{i+1}</td>
          <td><input step={0.2} type={'number'} placeholder={`a_i-1`} value={robot.dhTable[i].a_i_minus_1} onChange={(e) => {
            const v = e.currentTarget.value;
            setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, a_i_minus_1: parseFloat(v) }) : d) }))
          }} /></td>
          <td><input step={0.02} type={'number'} placeholder={`alpha_i-1`} value={robot.dhTable[i].alpha_i_minus_1} onChange={(e) => {
            const v = e.currentTarget.value;
            setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, alpha_i_minus_1: parseFloat(v) }) : d) }))
          }}/></td>
          <td>{ robot?.type[i] === 'P' ? <></> : <input step={0.2} type={'number'} placeholder={`d_i`} value={robot.dhTable[i].d_i} onChange={(e) => { 
            const v = e.currentTarget.value;
            setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, d_i: parseFloat(v) }) : d) }))
          }}/> }</td>
          <td>{ robot?.type[i] === 'R' ? <></> : <input step={0.02} type={'number'} placeholder={`theta_i`} value={robot.dhTable[i].theta_i} onChange={(e) => {
            const v = e.currentTarget.value;
            setRobot(r => ({ ...r, dhTable: r.dhTable.map((d, j) => j === i ? ({ ...d, theta_i: parseFloat(v) }) : d) }))
          }}/> }</td>
        </tr>)
      }</tbody></table>

    </div>
  </>
}