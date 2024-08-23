import { TestingModule } from "@nestjs/testing";
import { MyLogger } from "./logger.service";
import { createAppTestingModule } from "../../jest_mocking/module-mocking";

describe("MyLogger", () => {
	let logger: MyLogger;

	beforeEach(async () => {
		const moduleRef: TestingModule = await createAppTestingModule();
		logger = moduleRef.get<MyLogger>(MyLogger);
	});

	it("should be defined", () => {
		expect(logger).toBeDefined();
	});

	it("should log a message", () => {
		const message = "Test message";
		const spy = jest.spyOn(logger["logger"], "info");

		logger.log(message);

		expect(spy).toHaveBeenCalledWith(message);
	});

	it("should log an error message with trace", () => {
		const message = "Test error message";
		const trace = "Test trace";
		const spy = jest.spyOn(logger["logger"], "error");

		logger.error(message, trace);

		expect(spy).toHaveBeenCalledWith(message, { trace });
	});

	it("should log a warning message", () => {
		const message = "Test warning message";
		const spy = jest.spyOn(logger["logger"], "warn");

		logger.warn(message);

		expect(spy).toHaveBeenCalledWith(message);
	});

	it("should log a debug message", () => {
		const message = "Test debug message";
		const spy = jest.spyOn(logger["logger"], "debug");

		logger.debug(message);

		expect(spy).toHaveBeenCalledWith(message);
	});

	it("should log a verbose message", () => {
		const message = "Test verbose message";
		const spy = jest.spyOn(logger["logger"], "verbose");

		logger.verbose(message);

		expect(spy).toHaveBeenCalledWith(message);
	});
});
