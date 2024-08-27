import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
// import { MyLogger } from "./logger/logger.service";
import morgan from "morgan";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as fs from "fs";
import * as path from "path";
import * as jsyaml from "js-yaml";

declare const module: any;

async function bootstrap() {
	//const logger: MyLogger = new MyLogger();

	/*
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
        bodyParser: true,
    });
	*/

	let app: NestExpressApplication;
	// if files exist, use https, otherwise use http
	if (
		!fs.existsSync("certs/privkey.pem") ||
		!fs.existsSync("certs/fullchain.pem")
	) {
		console.log("Using HTTP");
		app = await NestFactory.create<NestExpressApplication>(AppModule);
	} else {
		const httpsOptions = {
			key: fs.readFileSync("certs/privkey.pem"),
			cert: fs.readFileSync("certs/fullchain.pem"),
		};
		console.log("Using HTTPS");
		app = await NestFactory.create<NestExpressApplication>(AppModule, {
			httpsOptions: httpsOptions,
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
		.addBearerAuth({
			description: `Please enter token in following format: Bearer <JWT>`,
			name: "Authorization",
			bearerFormat: "Bearer",
			scheme: "Bearer",
			type: "http",
			in: "Header",
		})
		.addServer("http://localhost:3000", "Development server")
		.addServer("https://tunein.co.za:3000", "Production server")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	const schemaJSON_string: string = JSON.stringify(document);
	const schemaObject = JSON.parse(schemaJSON_string);
	const yamlDocument = jsyaml.dump(schemaObject, {
		skipInvalid: true,
		noRefs: true,
	});

	const swaggerDir = path.resolve(__dirname, "../../../backend/openapi");
	if (!fs.existsSync(swaggerDir)) {
		fs.mkdirSync(swaggerDir, { recursive: true });
	}
	fs.writeFileSync(path.join(swaggerDir, "api.yaml"), yamlDocument);
	fs.writeFileSync(path.join(swaggerDir, "api.json"), schemaJSON_string);

	// CORS
	app.enableCors();

	// Hot Module Replacement
	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}

	// Rate Limiting
	/*
	app.use(
		RateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
		}),
	);
	*/

	app.use(
		morgan("combined", {
			stream: {
				write: (message: string) => {
					//logger.log(message.trim());
					console.log(message.trim());
				},
			},
		}),
	);

	await app.listen(3000);
}
bootstrap();
