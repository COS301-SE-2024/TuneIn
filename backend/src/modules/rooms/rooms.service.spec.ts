import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service'; // Adjust import based on file structure
import { PrismaService } from '../prisma.service'; // Adjust import based on file structure
import { DtoGenService } from '../dto-gen.service'; // Adjust import based on file structure
import { DbUtilsService } from '../db-utils.service'; // Adjust import based on file structure

describe("RoomsService", () => {
	let service: RoomsService;
	let prisma: PrismaService;
	let dtogen: DtoGenService;
	let dbUtils: DbUtilsService;

	beforeEach(async () => {
		const module: TestingModule = await createRoomsTestingModule();
		service = module.get<RoomsService>(RoomsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
