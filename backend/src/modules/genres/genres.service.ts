import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class GenresService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllGenres(): Promise<string[]> {
		const search = await this.prisma.genre.findMany();
		const genres_only: (string | null)[] = search.map((genre) => genre.genre);
		const result: string[] = [];
		for (let i = 0; i < genres_only.length; i++) {
			const g = genres_only[i];
			if (g !== null) {
				result.push(g);
			}
		}
		return result;
	}
}
