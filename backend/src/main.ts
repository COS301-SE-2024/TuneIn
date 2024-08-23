import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { MyLogger } from "./logger/logger.service";
import * as morgan from "morgan";

declare const module: any;

async function bootstrap() {
	const logger: MyLogger = new MyLogger();
	const app = await NestFactory.create(AppModule, {
		logger: logger, // Use custom logger
	});

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
