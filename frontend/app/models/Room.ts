// src/types/RoomCard.ts
const defaultProfileIcon = require("../../assets/profile-icon.png");

export interface Room {
	roomID?: string;
	backgroundImage: string;
	name: string;
	songName?: string | null;
	artistName?: string | null;
	description: string;
	userProfile?: string;
	userID: string;
	username?: string;
	mine?: boolean;
	tags: string[];
	playlist?: string[];
	genre?: string;
	language?: string;
	roomSize?: number;
	isExplicit?: boolean;
	isNsfw?: boolean;
	start_date: Date;
	end_date: Date;
}

export const formatRoomData = (room: any): Room => {
	return {
		roomID: room.id,
		backgroundImage: room.backgroundImage,
		name: room.name,
		language: room.language,
		songName: room.current_song ? room.current_song.title : null,
		artistName: room.artistName ? room.artistName : null,
		description: room.description,
		userID: room.userID,
		userProfile: room.userProfile ? room.userProfile : defaultProfileIcon,
		username: room.username ? room.username : "Unknown",
		roomSize: 55,
		tags: room.tags ? room.tags : [],
		mine: room.mine,
		isNsfw: room.isNsfw,
		isExplicit: room.isExplicit,
		start_date: room.start_date,
		end_date: room.end_date,
	};
};
