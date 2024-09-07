import React, { createContext, useState } from "react";
import { Room } from "../app/models/Room";
import { Track } from "../app/models/Track";
import { UserDto } from "../api";
import { RoomSongDto } from "./models/RoomSongDto";
import { VoteDto } from "./models/VoteDto";
import { useAPI } from "./APIContext";
import { AxiosResponse } from "axios";
import { RequiredError } from "../api/base";

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
	roomQueue: RoomSongDto[];
	setRoomQueue: React.Dispatch<React.SetStateAction<RoomSongDto[]>>;
	currentRoomID: string | null;
	setCurrentRoomID: React.Dispatch<React.SetStateAction<string | null>>;
	currentRoomDto: RoomSongDto | null;
	setCurrentRoomDto: React.Dispatch<React.SetStateAction<RoomSongDto | null>>;
	currentRoomVotes: VoteDto[];
	setCurrentRoomVotes: React.Dispatch<React.SetStateAction<VoteDto[]>>;
	getUser(): void;
}

console.log("hello player context!");
const Player = createContext<PlayerContextType | undefined>(undefined);

interface PlayerContextProviderProps {
	children: React.ReactNode;
}

const PlayerContextProvider: React.FC<PlayerContextProviderProps> = ({
	children,
}) => {
	const { users, rooms, authenticated } = useAPI();
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
	const [roomQueue, setRoomQueue] = useState<RoomSongDto[]>([]);
	const [currentRoomID, setCurrentRoomID] = useState<string | null>(null);
	const [currentRoomDto, setCurrentRoomDto] = useState<RoomSongDto | null>(
		null,
	);
	const [currentRoomVotes, setCurrentRoomVotes] = useState<VoteDto[]>([]);
	const [self, setSelf] = useState<UserDto | null>(null);

	const getUser = () => {
		if (authenticated && self === null) {
			users
				.getProfile()
				.then((user: AxiosResponse<UserDto>) => {
					console.log("User: " + user);
					if (user.status === 401) {
						//Unauthorized
						//Auth header is either missing or invalid
						setUserData(null);
					} else if (user.status === 500) {
						//Internal Server Error
						//Something went wrong in the backend (unlikely lmao)
						throw new Error("Internal Server Error");
					}
					setSelf(user.data);
					return user.data;
				})
				.catch((error) => {
					if (error instanceof RequiredError) {
						// a required field is missing
						throw new Error("Parameter missing from request to get user");
					} else {
						// some other error
						throw new Error("Error getting user");
					}
				});
		}
		return self;
	};

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
				roomQueue,
				setRoomQueue,
				currentRoomID,
				setCurrentRoomID,
				currentRoomDto,
				setCurrentRoomDto,
				currentRoomVotes,
				setCurrentRoomVotes,
				getUser,
			}}
		>
			{children}
		</Player.Provider>
	);
};

export { PlayerContextProvider, Player };
