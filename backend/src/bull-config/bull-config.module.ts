// bull.config.ts
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";

@Module({
	imports: [
		BullModule.forRoot({
			redis: {
				host: "localhost",
				port: 6379,
			},
		}),
	],
})
export class BullConfigModule {}
