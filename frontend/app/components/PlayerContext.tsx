import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface PlayerContextType {
  currentTrack: any;
  setCurrentTrack: Dispatch<SetStateAction<any>>;
}

const Player = createContext<PlayerContextType | undefined>(undefined);

const PlayerContext = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  return (
    <Player.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
    </Player.Provider>
  );
};

export { PlayerContext, Player, PlayerContextType };
