import { Test, TestingModule } from "@nestjs/testing";
import { ConnectedUsersService } from "./connecteduser.service";

import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";

import { mockPrismaService } from "../../../jest-mocking";

describe("ConnectedUsersService", () => {
	let service: ConnectedUsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [PrismaModule],
			providers: [
				{ provide: PrismaService, useValue: mockPrismaService },
				DtoGenService,
				DbUtilsService,
				ConnectedUsersService,
			],
		}).compile();

		service = module.get<ConnectedUsersService>(ConnectedUsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
