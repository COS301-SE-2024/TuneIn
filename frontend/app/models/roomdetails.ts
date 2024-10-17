export interface RoomDetailsProps {
	name: string;
	description: string;
	language: string;
	roomSize: number;
	isExplicit: boolean;
	isNsfw: boolean;
	tags: string[];
	start_date: Date | undefined;
	end_date: Date | undefined;
	date_created: Date;
	isPrivate: boolean;
	isScheduled: boolean;
}
