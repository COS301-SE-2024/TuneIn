import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";

import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../prisma/prisma.module";
import { SpotifyAuthModule } from "./spotify/spotifyauth.module";
import { SpotifyModule } from "../spotify/spotify.module";
import { AuthService } from "./auth.service";
import { UsersService } from "../modules/users/users.service";

import {
	mockConfigService,
	mockAuthService,
	mockUsersService,
} from "../../jest-mocking";

const JWT_SECRET_KEY: string | null = mockConfigService.get("JWT_SECRET_KEY");
if (!JWT_SECRET_KEY) {
	throw new Error("Mock JWT_SECRET_KEY is not defined");
}

describe("AuthController", () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				PassportModule,
				JwtModule.register({
					secret: JWT_SECRET_KEY,
					signOptions: { expiresIn: "2h" },
				}),
				ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
				PrismaModule,
				SpotifyModule,
				SpotifyAuthModule,
			],
			controllers: [AuthController],
			providers: [
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: UsersService, useValue: mockUsersService },
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
