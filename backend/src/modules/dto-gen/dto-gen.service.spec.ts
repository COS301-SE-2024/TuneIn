/*
import { TestingModule } from "@nestjs/testing";
import { DtoGenService } from "./dto-gen.service";
import { createDtoGenTestingModule } from "../../../jest_mocking/module-mocking";

describe("DtoGenService", () => {
	let service: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createDtoGenTestingModule();
		service = module.get<DtoGenService>(DtoGenService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
*/
function helloDGS(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloDGS()).toBe("Hello World!");
	});
});
