import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { RetryModule } from "../src/retry/retry.module";

@Module({
	imports: [RetryModule],
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
