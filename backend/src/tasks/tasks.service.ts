// tasks.service.ts
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class TasksService {
	constructor(@InjectQueue("task-queue") private readonly taskQueue: Queue) {}

	async addTask(taskData: any) {
		await this.taskQueue.add("process-task", taskData);
	}
}
