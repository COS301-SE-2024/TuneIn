import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { MyLogger } from "./logger/logger.service";

declare const module: any;

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: new MyLogger(), // Use custom logger
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

	await app.listen(3000);
}
bootstrap();
