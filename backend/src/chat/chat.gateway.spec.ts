import { Test, TestingModule } from "@nestjs/testing";
import { ChatGateway } from "./chat.gateway";

import { DbUtilsModule } from "../modules/db-utils/db-utils.module"; // Assuming this exists
import { DtoGenModule } from "../modules/dto-gen/dto-gen.module"; // Assuming this exists
import { RoomsModule } from "../modules/rooms/rooms.module";
import { ConnectedUsersModule } from "./connecteduser/connecteduser.module";
import { PrismaService } from "../../prisma/prisma.service";

import { mockConfigService, mockPrismaService } from "../../jest-mocking";
import { ConfigService } from "@nestjs/config";

describe("ChatGateway", () => {
	let gateway: ChatGateway;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ChatGateway,
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: PrismaService, useValue: mockPrismaService },
			],
			imports: [ConnectedUsersModule, DbUtilsModule, DtoGenModule, RoomsModule],
		}).compile();

		gateway = module.get<ChatGateway>(ChatGateway);
	});

	it("should be defined", () => {
		expect(gateway).toBeDefined();
	});
});
