import { Controller, Get } from "@nestjs/common";
import { GenresService } from "./genres.service";
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";

@Controller("genres")
export class GenresController {
	constructor(private readonly genresService: GenresService) {}

	@Get()
	@ApiTags("genres")
	@ApiOkResponse({
		description: "List of all genres",
		type: [String],
	})
	@ApiBadRequestResponse({
		description: "Something went wrong while fetching genres",
		type: String,
	})
	@ApiOperation({ summary: "Get all genres" })
	async getAllGenres(): Promise<string[]> {
		return await this.genresService.getAllGenres();
	}
}
