import { Module } from "@nestjs/common";
import { AutoModerationService } from "./automod.service";

@Module({
	providers: [AutoModerationService],
	exports: [AutoModerationService],
})
export class AutoModerationModule {}
