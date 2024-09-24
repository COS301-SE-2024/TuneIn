// tasks.service.ts
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { SpotifyTokenPair } from "../auth/spotify/spotifyauth.service";
import { ActiveRoom } from "../modules/rooms/roomqueue/roomqueue.service";
import * as Spotify from "@spotify/web-api-ts-sdk";

@Injectable()
export class TasksService {
	constructor(@InjectQueue("task-queue") private readonly taskQueue: Queue) {}

	async addTask(taskData: any) {
		await this.taskQueue.add("process-task", taskData);
	}

	async addImportLibraryTask(
		tk: SpotifyTokenPair,
		userID: string,
	): Promise<void> {
		await this.taskQueue.add("import-library", { token: tk, user_id: userID });
	}

	async getRoomSpotifyInfo(room: ActiveRoom, spotifyApi: Spotify.SpotifyApi) {
		await this.taskQueue.add("get-room-spotify-info", {
			room: room,
			api: spotifyApi,
		});
	}
}
