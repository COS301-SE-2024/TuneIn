import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, IsDate } from "class-validator";

/*
CREATE TABLE IF NOT EXISTS public.song
(
    song_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text COLLATE pg_catalog."default" NOT NULL,
    artist text COLLATE pg_catalog."default" NOT NULL,
    genre text COLLATE pg_catalog."default",
    lyrics_url text COLLATE pg_catalog."default",
    duration integer DEFAULT 0,
    genres text[] COLLATE pg_catalog."default",
    artwork_url text COLLATE pg_catalog."default",
    spotify_id text COLLATE pg_catalog."default",
    CONSTRAINT song_pkey PRIMARY KEY (song_id)
)
*/

export class SongInfoDto {
	@ApiProperty()
	@IsString()
	title: string;

	@ApiProperty({
		type: String,
		description: "The artists that performed the song",
		isArray: true,
	})
	@IsArray()
	artists: string[];

	@ApiProperty()
	@IsString()
	cover: string;

	@ApiProperty({
		description: "The time the song started playing",
		type: Date,
		nullable: true,
	})
	@IsDate()
	start_time: Date | null;
}
