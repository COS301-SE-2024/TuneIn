// src/types/RoomCard.ts
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
}

export const formatRoomData = (room: any): Room => {
	return {
		roomID: room.id,
		backgroundImage: room.backgroundImage,
		name: room.name,
		language: room.language,
		songName: room.current_song ? room.current_song.title : null,
		artistName: room.artistName ? room.current_song.artists.join(", ") : null,
		description: room.description,
		userID: room.userID,
		userProfile: room.userProfile
			? room.userProfile
			: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg",
		username: room.username ? room.username : "Unknown",
		roomSize: 55,
		genre: room.genre ? room.genre : null,
		tags: room.tags ? room.tags : [],
		mine: room.mine,
		isNsfw: room.isNsfw,
		isExplicit: room.isExplicit,
	};
};
