import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { RetryModule } from "../src/retry/retry.module";

@Module({
	providers: [PrismaService, RetryModule],
	exports: [PrismaService],
})
export class PrismaModule {}
