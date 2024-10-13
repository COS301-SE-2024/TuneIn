export type PlaybackEventDto = {
	date_created?: Date;
	userID: string | null;
	roomID: string;
	songID: string | null;
	UTC_time: number | null;
	errorMessage?: string;
};
