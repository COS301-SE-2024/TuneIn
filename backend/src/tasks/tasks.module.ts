// tasks.module.ts
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksProcessor } from "./tasks.processor";
import { PrismaModule } from "../../prisma/prisma.module";
import { SpotifyModule } from "src/spotify/spotify.module";

@Module({
	imports: [
		BullModule.registerQueue({
			name: "task-queue",
		}),
		PrismaModule,
		SpotifyModule,
	],
	providers: [TasksService, TasksProcessor],
	exports: [TasksService],
})
export class TasksModule {}
