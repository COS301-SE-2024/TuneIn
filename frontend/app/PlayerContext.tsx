import React, { createContext, useEffect, useState } from "react";
import { Room } from "../app/models/Room";
import { UserDto } from "../api";
import { useLive } from "./LiveContext";
import {
	constructArtistString,
	getAlbumArtUrl,
	getTitle,
} from "./models/RoomSongDto";
import { Track } from "@spotify/web-api-ts-sdk";

interface PlayerContextType {
	setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;
	currentTrack: Track | null;
	currentTrackIndex: number | null;
	setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number | null>>;
	currentRoom: Room | null;
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
	const [interfaceCurrentRoom, setInterfaceCurrentRoom] = useState<Room | null>(
		null,
	);
	const [trackName, setTrackName] = useState<string | null>(null);
	const [artistName, setArtistName] = useState<string | null>(null);
	const [albumArt, setAlbumArt] = useState<string | null>(null);
	const [userData, setUserData] = useState<UserDto | null>(null);

	const {
		roomControls,
		roomPlaying,
		joinRoom,
		leaveRoom,
		roomEmojiObjects,
		currentSong,
		currentRoom,
		currentUser,
		roomQueue,
		roomMessages,
		userBookmarks,
	} = useLive();

	useEffect(() => {
		if (!currentRoom) {
			setInterfaceCurrentRoom(null);
		} else {
			let start: Date = new Date(0);
			if (currentRoom.start_date) {
				start = new Date(currentRoom.start_date);
			}
			let end: Date = new Date(0);
			if (currentRoom.end_date) {
				end = new Date(currentRoom.end_date);
			}
			setInterfaceCurrentRoom({
				roomID: currentRoom.roomID,
				backgroundImage: currentRoom.room_image,
				name: currentRoom.room_name,
				songName: getTitle(currentSong),
				artistName: constructArtistString(currentSong),
				description: currentRoom.room_image,
				// userProfile?:
				userID: currentRoom.creator.userID,
				username: currentRoom.creator.username,
				mine: currentRoom.creator.userID === currentUser?.userID,
				tags: currentRoom.tags,
				// playlist?:
				//genre
				language: currentRoom.language,
				roomSize: currentRoom.participant_count,
				isExplicit: currentRoom.has_explicit_content,
				isNsfw: currentRoom.has_nsfw_content,
				start_date: start,
				end_date: end,
			});
		}
	}, [currentRoom, currentSong, currentUser?.userID]);

	useEffect(() => {
		if (!currentSong || !currentSong.track) {
			setCurrentTrack(null);
			setCurrentTrackIndex(null);
			setTrackName(null);
			setArtistName(null);
			setAlbumArt(null);
		} else {
			setCurrentTrack(currentSong.track);
			setCurrentTrackIndex(currentSong.index);
			setTrackName(getTitle(currentSong));
			setArtistName(constructArtistString(currentSong));
			setAlbumArt(getAlbumArtUrl(currentSong));
		}
	}, [currentSong]);

	useEffect(() => {
		if (!currentUser) {
			setUserData(null);
		} else {
			setUserData(currentUser);
		}
	}, [currentUser]);

	return (
		<Player.Provider
			value={{
				currentTrack,
				setCurrentTrack,
				currentTrackIndex,
				setCurrentTrackIndex,
				currentRoom: interfaceCurrentRoom,
				setCurrentRoom: setInterfaceCurrentRoom,
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
