import { TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { createTasksTestingModule } from "../../jest_mocking/module-mocking";

describe("TasksService", () => {
	let service: TasksService;

	beforeEach(async () => {
		const module: TestingModule = await createTasksTestingModule();
		service = module.get<TasksService>(TasksService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
