import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
// import pRetry from "@common.js/p-retry";

const RETRIES = 10;

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	constructor() {
		super();
		process.on("SIGINT", async () => {
			this.logger.warn(
				"SIGINT signal received. Closing database connection...",
			);
			await this.$disconnect();
			process.exit(0);
		});
	}

	async onModuleInit() {
		try {
			// await pRetry(
			// 	async () => {
			// 		await this.$connect();
			// 		this.logger.log("Connected to the database");
			// 		return;
			// 	},
			// 	{
			// 		onFailedAttempt: (error) => {
			// 			// console.log(
			// 			// 	`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
			// 			// );
			// 			this.logger.log(
			// 				`Database connection failed: ${error.message}. Retrying... (${
			// 					error.attemptNumber + 1
			// 				}/${RETRIES})`,
			// 			);
			// 		},
			// 		retries: RETRIES,
			// 	},
			// );
			await this.$connect();
			this.logger.log("Connected to the database");
		} catch (error) {
			console.error(error);
			this.logger.error(
				`Failed to connect to the database after ${RETRIES} retries. Exiting...`,
			);
			process.exit(1);
		}
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
