import { TestingModule } from "@nestjs/testing";
import { S3Service } from "./s3.service";
import { createS3TestingModule } from "../../jest_mocking/module-mocking";

describe("S3Service", () => {
	let service: S3Service;

	beforeEach(async () => {
		const module: TestingModule = await createS3TestingModule();
		service = module.get<S3Service>(S3Service);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
