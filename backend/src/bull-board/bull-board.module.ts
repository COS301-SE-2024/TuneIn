// bull-board/bull-board.module.ts
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { BullBoardService } from "./bull-board.service";
import { BullConfigModule } from "../bull-config/bull-config.module";

@Module({
	imports: [BullConfigModule, BullModule.registerQueue({ name: "task-queue" })],
	providers: [BullBoardService],
	exports: [BullBoardService], // Export if you want to use it outside this module
})
export class BullBoardModule {}
