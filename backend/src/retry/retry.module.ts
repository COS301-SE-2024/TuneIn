import { Module } from "@nestjs/common";
import { RetryService } from "./retry.service";

@Module({
	providers: [RetryService],
	exports: [RetryService],
})
export class RetryModule {}
