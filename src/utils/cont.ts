import React, { useContext } from 'react';

interface PlayerInfo {
    firstName: string,
    lastName: string,
    age?: number,
    playerNumber?: string | null
}

interface ContextType {
    playerInfo: PlayerInfo[],
    setPlayerInfo: React.Dispatch<React.SetStateAction<PlayerInfo[]>>
}

const Context = React.createContext<ContextType | null>(null);

export const usePlayerInfoContext = () => {
  const value = useContext(Context);
  if (!value)
    throw new Error('Ilegal use of context');

  return value;
};

export const PlayerInfoContextProvider = ({ children }: React.PropsWithChildren<any>) => {
  const [playerInfo, setPlayerInfo] = React.useState([] as PlayerInfo[]);
  const value = React.useMemo(() => ({
    playerInfo, setPlayerInfo,
  }), [playerInfo]);
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
