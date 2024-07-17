import { TestingModule } from "@nestjs/testing";
import { ChatGateway } from "./chat.gateway";
import { createChatTestingModule } from "../../jest_mocking/module-mocking";

describe("ChatGateway", () => {
	let gateway: ChatGateway;

	beforeEach(async () => {
		const module: TestingModule = await createChatTestingModule();
		gateway = module.get<ChatGateway>(ChatGateway);
	});

	it("should be defined", () => {
		expect(gateway).toBeDefined();
	});
});
