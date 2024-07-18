import { Injectable, Logger } from "@nestjs/common";
import * as async from "async";

export type TaskFunction = () => Promise<void>;

@Injectable()
export class EventQueueService {
	private readonly queue: async.QueueObject<TaskFunction>;
	private readonly logger = new Logger(EventQueueService.name);

	constructor() {
		this.queue = async.queue(async (task: TaskFunction) => {
			await task();
		}, 1); // Concurrency set to 1 to ensure FIFO processing

		this.queue.error((error, task) => {
			this.logger.error(`Task encountered an error: ${error}`, task.toString());
		});

		this.queue.drain(() => {
			this.logger.log("All tasks have been processed.");
		});
	}

	addToQueue(task: TaskFunction): void {
		this.queue.push(task);
	}
}
