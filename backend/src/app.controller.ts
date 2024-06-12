import {
	Controller,
	Get,
	Post,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3Service } from "./s3/s3.service";
import { diskStorage } from "multer";

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

	@Post("upload")
	@ApiOperation({ summary: "Upload a file to our AWS S3 storage bucket" })
	@UseInterceptors(
		FileInterceptor("file", {
			storage: diskStorage({
				destination: "./uploads",
				filename: (req, file, callback) => {
					const uniqueSuffix =
						Date.now() + "-" + Math.round(Math.random() * 1e9);
					const filename = `${uniqueSuffix}-${file.originalname}`;
					callback(null, filename);
				},
			}),
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
		const result = await this.s3Service.uploadFile(file);
		return {
			url: result.Location,
		};
	}
}
