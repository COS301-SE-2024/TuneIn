import { Test, TestingModule } from "@nestjs/testing";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "./../../../prisma/prisma.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { AuthService } from "../../auth/auth.service";

import { mockPrismaService, mockConfigService } from "../../../jest-mocking";
import { ConfigService } from "@nestjs/config";

describe("RoomsController", () => {
	let controller: RoomsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoomsController],
			providers: [
				RoomsService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: ConfigService, useValue: mockConfigService },
				DtoGenService,
				DbUtilsService,
				AuthService,
			],
		}).compile();

		controller = module.get<RoomsController>(RoomsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
