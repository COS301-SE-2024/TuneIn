// PlayerContext.tsx

import React, { createContext, useContext, useState } from "react";

interface PlayerContextType {
	currentTrackIndex: number;
	setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>;
	currentRoom: string;
	setCurrentRoom: React.Dispatch<React.SetStateAction<string>>;
	roomId: string | null;
	setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
	const context = useContext(PlayerContext);
	if (!context) {
		throw new Error(
			"usePlayerContext must be used within a PlayerContextProvider",
		);
	}
	return context;
};

interface PlayerContextProviderProps {
	children: React.ReactNode;
}

export const PlayerContextProvider: React.FC<PlayerContextProviderProps> = ({
	children,
}) => {
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [currentRoom, setCurrentRoom] = useState("defaultRoom");
	const [roomId, setRoomId] = useState<string | null>(null);

	return (
		<PlayerContext.Provider
			value={{
				currentTrackIndex,
				setCurrentTrackIndex,
				currentRoom,
				setCurrentRoom,
				roomId,
				setRoomId,
			}}
		>
			{children}
		</PlayerContext.Provider>
	);
};
