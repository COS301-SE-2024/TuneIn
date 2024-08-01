import { TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { createAuthTestingModule } from "../../jest_mocking/module-mocking";

describe("AuthController", () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await createAuthTestingModule();
		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});

//example of how to e2e test a controller
//https://github.com/VincentJouanne/nest-clean-architecture/blob/master/identity-and-access/__tests__/e2e/signIn.controller.spec.ts