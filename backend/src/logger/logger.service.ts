import { Injectable, LoggerService } from "@nestjs/common";
import { createLogger, format, transports } from "winston";

@Injectable()
export class MyLogger implements LoggerService {
	private readonly logger = createLogger({
		level: "info",
		format: format.combine(format.timestamp(), format.json()),
		transports: [
			new transports.Console(),
			new transports.File({ filename: "combined.log" }),
			new transports.File({ filename: "errors.log", level: "error" }),
		],
	});

	log(message: string) {
		this.logger.info(message);
	}

	error(message: string, trace: string) {
		this.logger.error(message, { trace });
	}

	warn(message: string) {
		this.logger.warn(message);
	}

	debug(message: string) {
		this.logger.debug(message);
	}

	verbose(message: string) {
		this.logger.verbose(message);
	}
}
