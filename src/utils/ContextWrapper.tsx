import React from "react";
import { InputType } from "../components/ui/input-type";
import { Context } from "./inputTypeContext"

export const ContextWrapper = ({ children }: React.PropsWithChildren<any>) => {

  const [inputType, setInputType] = React.useState(InputType.FwdKin);
  const value = React.useMemo(() => ({
    inputType, setInputType,
  }), [inputType]);

  return <Context.Provider value={value}>
    { children }
  </Context.Provider>
}