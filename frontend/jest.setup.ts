// jest.setup.js
import dotenv from "dotenv";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
//import * as jwt from "jwt-decode";
import JWT from "expo-jwt";

dotenv.config({ path: ".env" });
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
global.alert = jest.fn();

const mockToken: string = JWT.encode(
	{
		sub: "123456789",
		aud: "123456789",
		exp: Number.MAX_SAFE_INTEGER,
		nbf: Number.MAX_SAFE_INTEGER,
		iat: Number.MAX_SAFE_INTEGER,
		jti: "123456789",
	},
	"mock-secret-key",
);

// Mocking StorageService module functions
jest.mock("./app/services/StorageService", () => ({
	setItem: jest.fn().mockResolvedValue(undefined),

	// return a mock value unless the input is "token"
	getItem: jest.fn().mockImplementation((key: string) => {
		if (key === "token") {
			return mockToken;
		}
		return jest.fn().mockResolvedValue(undefined);
	}),
	removeItem: jest.fn().mockResolvedValue(undefined),
	clear: jest
		.fn()
		.mockResolvedValue(undefined)
		.mockImplementation(() => console.log("Mock storage cleared")),
}));

jest.mock("socket.io-client", () => {
	return {
		io: jest.fn(() => ({
			on: jest.fn(),
			emit: jest.fn(),
			connect: jest.fn(),
			disconnect: jest.fn(),
			volatile: {
				emit: jest.fn(),
			},
		})),
	};
});
