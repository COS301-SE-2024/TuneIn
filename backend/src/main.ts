import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { MyLogger } from "./logger/logger.service";
import * as morgan from "morgan";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as fs from "fs";

declare const module: any;

async function bootstrap() {
	const logger: MyLogger = new MyLogger();

	let app: NestExpressApplication;
	// if files exist, use https, otherwise use http
	if (!fs.existsSync('/etc/letsencrypt/live/tunein.co.za/privkey.pem') || !fs.existsSync('/etc/letsencrypt/live/tunein.co.za/fullchain.pem')) {
		app = await NestFactory.create<NestExpressApplication>(AppModule, {
			logger: logger, // Use custom logger
		});
	}
	else {
		const httpsOptions = {
			key: fs.readFileSync('/etc/letsencrypt/live/tunein.co.za/privkey.pem'),
			cert: fs.readFileSync('/etc/letsencrypt/live/tunein.co.za/fullchain.pem'),
		};
		app = await NestFactory.create<NestExpressApplication>(AppModule, {
			httpsOptions: httpsOptions,
			logger: logger, // Use custom logger
		});
	}

	// Validation
	app.useGlobalPipes(new ValidationPipe());

	// Swagger
	const config = new DocumentBuilder()
		.setTitle("TuneIn API")
		.setDescription(
			"The API for the TuneIn application, handling all the backend logic and making it available to the frontend.",
		)
		.setVersion("1.0")
		.addTag("TuneIn")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	// CORS
	app.enableCors();

	// Hot Module Replacement
	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}

	app.use(morgan('combined', {
		stream: {
		write: (message: string) => logger.log(message.trim()),
		},
	}));

	await app.listen(3000);
}
bootstrap();
