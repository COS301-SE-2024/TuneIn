import { Test, TestingModule } from "@nestjs/testing";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { AuthService } from "../../auth/auth.service";

import { mockPrismaService, mockConfigService } from "../../../jest_mocking/service-mocking";
import { ConfigService } from "@nestjs/config";

describe("ProfileController", () => {
	let controller: ProfileController;

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

		controller = module.get<ProfileController>(ProfileController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
