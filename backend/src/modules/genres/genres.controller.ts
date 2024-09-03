import { Controller, Get } from "@nestjs/common";
import { GenresService } from "./genres.service";
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";

@Controller("genres")
@ApiTags("genres")
export class GenresController {
	constructor(private readonly genresService: GenresService) {}

	@Get()
	@ApiOkResponse({
		description: "List of all genres",
		type: String,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Something went wrong while fetching genres",
		type: String,
	})
	@ApiOperation({
		summary: "Get all genres",
		description: "Returns a list of all genres",
	})
	async getAllGenres(): Promise<string[]> {
		return await this.genresService.getAllGenres();
	}
}
