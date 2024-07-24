import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";

@Injectable()
export class SongsService {
	constructor(private readonly prisma: PrismaService) {}

	async getSpotifyId(songID: string): Promise<{ id: string }> {
		const song: PrismaTypes.song | null = await this.prisma.song.findUnique({
			where: {
				song_id: songID,
			},
		});
		if (!song || !song.spotify_id) {
			return { id: "null" };
		}
		return { id: song.spotify_id };
	}
}
