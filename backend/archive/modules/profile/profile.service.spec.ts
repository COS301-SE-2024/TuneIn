import { Test, TestingModule } from "@nestjs/testing";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
import { PrismaService } from "../../../prisma/prisma.service";
// import { DtoGenService } from "../dto-gen/dto-gen.service";
// import { DbUtilsService } from "../db-utils/db-utils.service";
// import { AuthService } from "../../auth/auth.service";

import {
	mockPrismaService,
	mockConfigService,
} from "../../../jest_mocking/service-mocking";
import { ConfigService } from "@nestjs/config";
import { DtoGenService } from "src/modules/dto-gen/dto-gen.service";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { AuthService } from "src/auth/auth.service";

describe("ProfileService", () => {
	let service: ProfileService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProfileController],
			providers: [
				ProfileService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: ConfigService, useValue: mockConfigService },
				DtoGenService,
				DbUtilsService,
				AuthService,
			],
		}).compile();

		service = module.get<ProfileService>(ProfileService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
