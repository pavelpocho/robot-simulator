// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { matrix, multiply, pinv } from "mathjs";
import { InputType } from "../../components/ui/input-type";
import { useInputTypeContext } from "../contexts/InputTypeContext";
import { useJacobianCodeContext } from "../contexts/JacobianCodeContext";
import { useRobotContext } from "../contexts/RobotContext";
import { getEvaluatedJacobian } from "../hooks/robotHooks";
import { useInterval } from "../hooks/useInterval";
import vector from "../vector";

export const useVelocityLoop = () => {

  const { inputType } = useInputTypeContext();
  const { robot, setRobot } = useRobotContext();
  const { jacobianCode } = useJacobianCodeContext();

  useInterval(() => {
    if (inputType == InputType.JointVel && jacobianCode != null) {
      const jointPositions = robot.jointPositions.map(j => j);
      robot.jointVelocities.forEach((jV, i) => {
        jointPositions[i] += jV * 0.005;
      });
      const jacobian = getEvaluatedJacobian(robot, jacobianCode);
      const cartVels = multiply(jacobian, vector(robot.jointVelocities));
      setRobot(r => ({ ...r, jointPositions, cartesianEEVelocities: cartVels.toArray() }))
    }
    else if (inputType == InputType.CartVel && jacobianCode != null) {
      const jacobian = getEvaluatedJacobian(robot, jacobianCode);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const inverseJacobian = pinv(jacobian);
      const jointVelocities = multiply(inverseJacobian, vector(robot.cartesianEEVelocities)).toArray();
      const jointPositions = robot.jointPositions.map(j => j);
      robot.jointVelocities.forEach((jV, i) => {
        jointPositions[i] += jV * 0.005;
      });
      setRobot(r => ({ ...r, jointVelocities, jointPositions }))
    }
  }, 5);
}