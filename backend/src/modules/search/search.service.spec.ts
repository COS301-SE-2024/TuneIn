import { TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";
import { MockContext, Context, createMockContext } from "../../../test/context";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";

// jest.mock("../../../prisma/prisma.service", () => ({
// 	$queryRaw: jest.fn(),
// }));
jest.mock("../db-utils/db-utils.service");
jest.mock("../dto-gen/dto-gen.service");

describe("searchUsers function", () => {
	let service: SearchService;
	let prisma: PrismaService;
	let dbUtils: DbUtilsService;
	let dtoGen: DtoGenService;
	let mockCtx: MockContext;
	let ctx: Context;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		prisma = module.get<PrismaService>(PrismaService);
		mockCtx = createMockContext();
		ctx = mockCtx as unknown as Context;
	});

	it("should return an empty UserDto array when query returns an empty array", async () => {
		mockCtx.prisma.$queryRaw.mockResolvedValue([]);

		const result = await service.searchUsers("testing");

		expect(result).toMatchObject([new UserDto()]);
	});
});
