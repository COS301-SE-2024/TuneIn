import { TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";
import { prismaMock } from '../../../singleton'
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";

jest.mock("../db-utils/db-utils.service");
jest.mock("../dto-gen/dto-gen.service");

describe("searchUsers function", () => {
	let service: SearchService;
	let dbUtils: DbUtilsService;
	let dtoGen: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty UserDto array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValue([]);

		const result = await service.searchUsers("testing");

		expect(result).toMatchObject([new UserDto()]);
	});
});
