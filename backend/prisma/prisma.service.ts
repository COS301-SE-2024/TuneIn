import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { RetryService, RetryStatus } from "../src/retry/retry.service";

const RETRIES = 10;

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	constructor(private readonly retryService: RetryService) {
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
			const executeRequest = async (status: RetryStatus) => {
				if (status.index > 0) {
					console.log(`Retrying... Attempt #${status.index + 1}`);
				}
				return await this.$connect().then(() => {
					this.logger.log("Connected to the database");
				});
			};

			// Call retryAsync, passing the function and options
			await this.retryService.retryAsync(executeRequest, {
				retry: RETRIES,
				delay: (status: RetryStatus) => {
					// Optionally use exponential backoff or fixed delay
					const delay = Math.pow(2, status.index) * 50; // Exponential backoff (50ms * 2^index)
					console.log(
						`Waiting for ${delay}ms before attempting database reconnection...`,
					);
					return delay;
				},
				error: (status: RetryStatus) => {
					console.error(
						`Error encountered on attempt #${status.index + 1}:`,
						status.error.message,
					);
				},
			});
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
