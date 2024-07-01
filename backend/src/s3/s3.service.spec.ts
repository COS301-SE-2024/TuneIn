import { Test, TestingModule } from "@nestjs/testing";
import { S3Service } from "./s3.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { mockConfigService } from "../../jest-mocking";

describe("S3Service", () => {
	let service: S3Service;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule],
			providers: [
				S3Service,
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		service = module.get<S3Service>(S3Service);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
