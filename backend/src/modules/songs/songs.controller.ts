import { Controller, Get, Param } from "@nestjs/common";
import { SongsService } from "./songs.service";
import {
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";

@Controller("songs")
export class SongsController {
	constructor(private readonly songsService: SongsService) {}

	/*
	@Get(":songID/spotify")
	@ApiTags("songs")
	@ApiOkResponse({
		description: "The spotify id of the song.",
		type: "string | null",
	})
	@ApiParam({ name: "songID", required: true })
	@ApiOperation({ summary: "Get the Spotify ID of a song with given ID" })
	async getSpotifyId(@Param("songID") songID: string): Promise<{ id: string }> {
		return await this.songsService.getSpotifyId(songID);
	}
	*/
}
