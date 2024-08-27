import React, { createContext, useState } from "react";
import { Room } from "../app/models/Room";
import { Track } from "../app/models/Track";
import { UserDto } from "../api-client";

interface PlayerContextType {
	setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;
	currentTrack: Track | null;
	currentTrackIndex: number | null;
	setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number | null>>;
	currentRoom: Room | null;
	NumberOfPeople: number | null;
	setNumberOfPeople: React.Dispatch<React.SetStateAction<number | null>>;
	setCurrentRoom: React.Dispatch<React.SetStateAction<Room | null>>;
	trackName: string | null;
	setTrackName: React.Dispatch<React.SetStateAction<string | null>>;
	artistName: string | null;
	setArtistName: React.Dispatch<React.SetStateAction<string | null>>;
	albumArt: string | null;
	setAlbumArt: React.Dispatch<React.SetStateAction<string | null>>;
	userData: UserDto | null;
	setUserData: React.Dispatch<React.SetStateAction<UserDto | null>>;
}

console.log("hello player context!");
const Player = createContext<PlayerContextType | undefined>(undefined);

interface PlayerContextProviderProps {
	children: React.ReactNode;
}

const PlayerContextProvider: React.FC<PlayerContextProviderProps> = ({
	children,
}) => {
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(
		null,
	);
	const [NumberOfPeople, setNumberOfPeople] = useState<number | null>(null);
	const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
	const [trackName, setTrackName] = useState<string | null>(null);
	const [artistName, setArtistName] = useState<string | null>(null);
	const [albumArt, setAlbumArt] = useState<string | null>(null);
	const [userData, setUserData] = useState<UserDto | null>(null);

	return (
		<Player.Provider
			value={{
				setNumberOfPeople,
				NumberOfPeople,
				currentTrack,
				setCurrentTrack,
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
				userData,
				setUserData,
			}}
		>
			{children}
		</Player.Provider>
	);
};

export { PlayerContextProvider, Player };
