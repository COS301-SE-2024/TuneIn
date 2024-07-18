import { Injectable, Logger } from "@nestjs/common";
import * as async from "async";

//custom type for task function (because it's more type-safe than the default 'Function')
export type TaskFunction = () => Promise<void>;

@Injectable()
export class EventQueueService {
	private readonly queue: async.QueueObject<TaskFunction>;
	private readonly logger = new Logger(EventQueueService.name);

	constructor() {
		this.queue = async.queue(async (task: TaskFunction, done) => {
			try {
				await task();
				done();
			} catch (error) {
				this.logger.error(`Task failed: ${error}`);
				done(error);
			}
		}, 1); // Concurrency set to 1 to ensure FIFO processing

		this.queue.error((error, task) => {
			this.logger.error(`Task encountered an error: ${error}`, task.toString());
		});

		this.queue.drain(() => {
			this.logger.log("All tasks have been processed.");
		});
	}

	addToQueue(task: TaskFunction): void {
		this.queue.push(task, (err) => {
			if (err) {
				this.logger.error(`Error executing task: ${err}`);
			} else {
				this.logger.log("Task completed successfully.");
			}
		});
		this.logger.log("Task added to the queue.");
	}
}
