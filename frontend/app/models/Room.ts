// src/types/RoomCard.ts
export interface Room {
	roomID?: string;
	backgroundImage: string;
	name: string;
	songName?: string;
	artistName?: string;
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
