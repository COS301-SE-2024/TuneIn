import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Validation
	app.useGlobalPipes(new ValidationPipe());

	// Swagger
	const config = new DocumentBuilder()
		.setTitle("My API")
		.setDescription("API description")
		.setVersion("1.0")
		.addTag("api")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	app.enableCors();

	await app.listen(3000);
}
bootstrap();
