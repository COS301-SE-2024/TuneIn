import React, { createContext, useEffect, useState } from "react";
import { Room } from "../app/models/Room";
import { Track } from "../app/models/Track";
import { UserDto } from "../api";
import CurrentRoom from "./screens/rooms/functions/CurrentRoom";
import { getItem } from "./services/StorageService";

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
	useEffect(() => {
		async function fetchData() {
			try {
				const currentRoomHandler: CurrentRoom = new CurrentRoom();
				const token: string | null = await getItem("token");
				if (!token) {
					console.log("no token");
					return;
				}
				const result = await currentRoomHandler.getCurrentRoom(token);
				if (!result) {
					console.log("no result");
					return;
				}
				const room: Room = {
					userID: result.creator.userID,
					roomID: result.roomID,
					name: result.room_name,
					description: result.description,
					backgroundImage: result.room_image,
					start_date: result.start_date,
					end_date: result.end_date,
					tags: result.tags,
				};
				setCurrentRoom(room);
			} catch (error) {
				console.error("Error fetching data: ", error);
			}
		}
		fetchData();
	}, []);
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
