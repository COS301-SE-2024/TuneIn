import { Test, TestingModule } from "@nestjs/testing";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "./../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { AuthService } from "../../auth/auth.service";

import { mockPrismaService, mockConfigService } from "../../../jest-mocking";
import { ConfigService } from "@nestjs/config";

describe("RoomsService", () => {
	let service: RoomsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RoomsService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: ConfigService, useValue: mockConfigService },
				DtoGenService,
				DbUtilsService,
				AuthService,
			],
			imports: [PrismaModule],
		}).compile();

		service = module.get<RoomsService>(RoomsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
