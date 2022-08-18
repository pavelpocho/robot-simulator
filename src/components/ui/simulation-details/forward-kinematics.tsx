import { MathComponent } from "mathjax-react";
import { useInputTypeContext } from "../../../utils/contexts/InputTypeContext"
import { useMathJaxTMCombined, useMathJaxTMSolved, useMathJaxTMSubstituted } from "../../../utils/hooks/robotHooks";
import { InputType } from "../input-type";

export const ForwardKinematicsSimulationDetails = () => {
  
  const { inputType } = useInputTypeContext();

  const substitutedMatrices = useMathJaxTMSubstituted();
  const solvedMatrices = useMathJaxTMSolved();

  const combinedMatrices = useMathJaxTMCombined();

  return inputType === InputType.FwdKin ? (<>
    <MathComponent tex={String.raw`{_i^{i-1}}T=\left[ \begin{array}{ccc}c\theta_i & -s\theta_i & 0 & a_{i-1} \\ s\theta_ic\alpha_{i-1} & c\theta_ic\alpha_{i-1} & -s\alpha_{i-1} & -s\alpha_{i-1}d_i \\ s\theta_is\alpha_{i-1} & c\theta_is\alpha_{i-1} & c\alpha_{i-1} & c\alpha_{i-1}d_i \\ 0 & 0 & 0 & 1\end{array} \right]`} />
    { substitutedMatrices }
    { solvedMatrices }
    { combinedMatrices }
  </>) : <></>

}