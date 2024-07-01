// tasks.module.ts
import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksProcessor } from "./tasks.processor";
import { PrismaModule } from "../../prisma/prisma.module";
import { SpotifyModule } from "../spotify/spotify.module";
import { BullBoardModule } from "../bull-board/bull-board.module";
import { BullModule } from "@nestjs/bull";

@Module({
	imports: [
		BullModule.registerQueue({
			name: "task-queue",
		}),
		PrismaModule,
		SpotifyModule,
		BullBoardModule,
	],
	providers: [TasksService, TasksProcessor],
	exports: [TasksService],
})
export class TasksModule {}
