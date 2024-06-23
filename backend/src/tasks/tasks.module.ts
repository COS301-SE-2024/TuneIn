// tasks.module.ts
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksProcessor } from "./tasks.processor";

@Module({
	imports: [
		BullModule.registerQueue({
			name: "task-queue",
		}),
	],
	providers: [TasksService, TasksProcessor],
	exports: [TasksService],
})
export class TasksModule {}
