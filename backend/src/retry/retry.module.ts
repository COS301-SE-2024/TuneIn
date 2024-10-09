import { Module } from "@nestjs/common";
import { RetryService } from "./retry.service";

@Module({
	providers: [RetryService],
})
export class RetryModule {}
