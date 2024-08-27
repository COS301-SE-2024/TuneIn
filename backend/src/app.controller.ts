import {
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { AppService } from "./app.service";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3Service } from "./s3/s3.service";
import { memoryStorage } from "multer";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly s3Service: S3Service,
	) {}

	@Get()
	@ApiOperation({ summary: "Hello World!" })
	@ApiOkResponse({
		description: "Hello World!",
		type: String,
	})
	getHello(): string {
		return this.appService.getHello();
	}

	/*
	curl -v -X POST http://localhost:3000/upload -F "file=@/Users/lesedikekana/Downloads/f.jpg"
	*/
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post("upload")
	@ApiOperation({ summary: "Upload a file to our AWS S3 storage bucket" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		description: "A file to upload to our AWS S3 storage bucket",
		schema: {
			type: "object",
			properties: {
				file: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	@ApiOkResponse({
		description: "The URL of the uploaded file",
		type: String,
	})
	/*
	@ApiBadRequestResponse({
		description: "Bad request. The file is not a .png or .jpg file.",
	})
	@ApiPayloadTooLargeResponse({
		description: "The file is too large. It must be less than 5MB.",
	})
	*/
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			/*
			limits: { fileSize: 5 * 1024 * 1024 },
			fileFilter: (req, file, callback) => {
				if (!file.originalname.match(/\.(jpg|png)$/)) {
					return callback(
						new Error("Only .png and .jpg files are allowed!"),
						false,
					);
				}
				callback(null, true);
			},
			*/
		}),
	)
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		console.log("File uploaded");
		console.log(file);
		if (!file) {
			throw new HttpException("No file uploaded", HttpStatus.BAD_REQUEST);
		}
		const result = await this.s3Service.uploadFile(file);
		return {
			url: result.Location,
		};
	}
}
