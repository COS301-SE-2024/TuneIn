import { Injectable } from "@nestjs/common";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import * as awsS3 from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { Express } from "express";

@Injectable()
export class S3Service {
	private s3: S3;
	private bucketName: string;
	private accessKeyId: string;
	private secretAccessKey: string;
	private region: string;

	constructor(private configService: ConfigService) {
		const bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME");
		if (!bucketName) {
			throw new Error("AWS_S3_BUCKET_NAME is not defined");
		}
		this.bucketName = bucketName;

		const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID");
		if (!accessKeyId) {
			throw new Error("AWS_ACCESS_KEY_ID is not defined");
		}
		this.accessKeyId = accessKeyId;

		const secretAccessKey = this.configService.get<string>(
			"AWS_SECRET_ACCESS_KEY",
		);
		if (!secretAccessKey) {
			throw new Error("AWS_SECRET_ACCESS_KEY is not defined");
		}
		this.secretAccessKey = secretAccessKey;

		const region = this.configService.get<string>("AWS_S3_REGION");
		if (!region) {
			throw new Error("AWS_S3_REGION is not defined");
		}
		this.region = region;

		this.s3 = new S3({
			credentials: {
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey,
			},

			region: this.region,
		});
		this.bucketName = bucketName;
	}

	async uploadFile(
		file: Express.Multer.File,
	): Promise<awsS3.CompleteMultipartUploadOutput> {
		console.log("Uploading file to S3");
		console.log(file);
		const params = {
			Bucket: this.bucketName,
			Key: `${Date.now()}-${file.originalname}`,
			Body: file.buffer,
			ContentType: file.mimetype,
		};

		const va = await new Upload({
			client: this.s3,
			params,
		}).done();
		if (!va.Location) {
			throw new Error("Failed to upload file to S3");
		}
		console.log("File uploaded to S3");
		console.log(va);
		return va;
	}

	async getFileUrl(key: string): Promise<string> {
		const params = { Bucket: this.bucketName, Key: key };
		return getSignedUrl(this.s3, new GetObjectCommand(params));
	}
}
