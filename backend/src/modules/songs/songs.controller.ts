import { Controller } from "@nestjs/common";
import { SongsService } from "./songs.service";

@Controller("songs")
export class SongsController {
	constructor(private readonly songsService: SongsService) {}
}
