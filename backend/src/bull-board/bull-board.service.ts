import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import * as express from "express";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class BullBoardService implements OnModuleInit {
	private static serverStarted = false; // Static property to track server status

	constructor(@InjectQueue("task-queue") private readonly taskQueue: Queue) {}

	onModuleInit() {
		if (BullBoardService.serverStarted) {
			console.log("Bull Board server is already running.");
			return;
		}

		const serverAdapter = new ExpressAdapter();
		createBullBoard({
			queues: [new BullAdapter(this.taskQueue)],
			serverAdapter,
		});

		const app = express();
		serverAdapter.setBasePath("/admin/queues");
		app.use("/admin/queues", serverAdapter.getRouter());

		const port = 3001;
		app
			.listen(port, () => {
				console.log(
					`Bull Board is running on http://localhost:${port}/admin/queues`,
				);
				BullBoardService.serverStarted = true; // Mark server as started
			})
			.on("error", (err) => {
				console.error(err);
			});
	}
}
