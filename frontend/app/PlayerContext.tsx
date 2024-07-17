import React, { createContext, useContext, useState, useEffect } from "react";

interface PlayerContextType {
	currentTrackIndex: number | null;
	setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number | null>>;
	currentRoom: string | null;
	setCurrentRoom: React.Dispatch<React.SetStateAction<string | null>>;
	trackName: string | null;
	setTrackName: React.Dispatch<React.SetStateAction<string | null>>;
	artistName: string | null;
	setArtistName: React.Dispatch<React.SetStateAction<string | null>>;
	albumArt: string | null;
	setAlbumArt: React.Dispatch<React.SetStateAction<string | null>>;
}

console.log("hello player context!");
const Player = createContext<PlayerContextType | undefined>(undefined);

interface PlayerContextProviderProps {
	children: React.ReactNode;
}

const PlayerContextProvider: React.FC<PlayerContextProviderProps> = ({
	children,
}) => {
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(
		null,
	);
	const [currentRoom, setCurrentRoom] = useState<string | null>(null);
	const [trackName, setTrackName] = useState<string | null>(null);
	const [artistName, setArtistName] = useState<string | null>(null);
	const [albumArt, setAlbumArt] = useState<string | null>(null);

	// Log the current room whenever it changes
	useEffect(() => {
		if (currentRoom !== null) {
			console.log(`Current room is set to: ${currentRoom}`);
		} else {
			console.log("No current room set");
		}
	}, [currentRoom]);

	return (
		<Player.Provider
			value={{
				currentTrackIndex,
				setCurrentTrackIndex,
				currentRoom,
				setCurrentRoom,
				trackName,
				setTrackName,
				artistName,
				setArtistName,
				albumArt,
				setAlbumArt,
			}}
		>
			{children}
		</Player.Provider>
	);
};

export { PlayerContextProvider, Player };
