import React, { createContext, useContext, useState } from "react";

interface PlayerContextType {
	currentTrackIndex: number;
	setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>;
	currentRoom: string;
	setCurrentRoom: React.Dispatch<React.SetStateAction<string>>;
	roomId: string | null;
	setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
	trackName: string;
	setTrackName: React.Dispatch<React.SetStateAction<string>>;
	artistName: string;
	setArtistName: React.Dispatch<React.SetStateAction<string>>;
	albumArt: string;
	setAlbumArt: React.Dispatch<React.SetStateAction<string>>;
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
	const [trackName, setTrackName] = useState("");
	const [artistName, setArtistName] = useState("");
	const [albumArt, setAlbumArt] = useState("");

	return (
		<PlayerContext.Provider
			value={{
				currentTrackIndex,
				setCurrentTrackIndex,
				currentRoom,
				setCurrentRoom,
				roomId,
				setRoomId,
				trackName,
				setTrackName,
				artistName,
				setArtistName,
				albumArt,
				setAlbumArt,
			}}
		>
			{children}
		</PlayerContext.Provider>
	);
};
