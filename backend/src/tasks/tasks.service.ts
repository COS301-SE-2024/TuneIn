// tasks.service.ts
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { SpotifyTokenPair } from "src/auth/spotify/spotifyauth.service";

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
}
