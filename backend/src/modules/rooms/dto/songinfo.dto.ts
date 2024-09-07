import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsString,
	IsArray,
	IsDate,
	IsNumber,
	IsOptional,
} from "class-validator";

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
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	songID?: string;

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

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	cover?: string;

	@ApiProperty()
	@IsNumber()
	duration: number;

	@ApiProperty()
	@IsString()
	spotify_id: string;

	@ApiPropertyOptional({
		description: "The time the song started playing",
		type: Date,
		nullable: true,
	})
	@IsOptional()
	@IsDate()
	start_time?: Date;
}
