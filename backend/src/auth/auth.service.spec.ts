import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";

import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../prisma/prisma.module";
import { SpotifyAuthModule } from "./spotify/spotifyauth.module";
import { SpotifyModule } from "../spotify/spotify.module";

import { mockConfigService } from "../../jest-mocking";
const JWT_SECRET_KEY: string | null = mockConfigService.get("JWT_SECRET_KEY");
if (!JWT_SECRET_KEY) {
	throw new Error("Mock JWT_SECRET_KEY is not defined");
}

describe("AuthService", () => {
	let service: AuthService;

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
			providers: [
				AuthService,
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
