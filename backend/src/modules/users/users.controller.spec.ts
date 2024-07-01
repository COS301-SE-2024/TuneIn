import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { PrismaModule } from "../../../prisma/prisma.module";
import { UsersService } from "./users.service";
import { PrismaService } from "./../../../prisma/prisma.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { AuthService } from "../../auth/auth.service";
import { ConfigService } from "@nestjs/config";
import { mockConfigService, mockPrismaService } from "../../../jest-mocking";

describe("UsersController", () => {
	let controller: UsersController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [PrismaModule],
			providers: [
				UsersService,
				{ provide: PrismaService, useValue: mockPrismaService },
				DtoGenService,
				DbUtilsService,
				AuthService,
				{ provide: ConfigService, useValue: mockConfigService }, // Provide the mockConfigService
			],
			controllers: [UsersController],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
