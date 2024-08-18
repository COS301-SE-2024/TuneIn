// jest.setup.js
import dotenv from "dotenv";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import * as jwt from "jwt-decode";
import JWT from "expo-jwt";

dotenv.config({ path: ".env" });
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
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

jest.mock("./app/services/Live", () => {
	const originalModule = jest.requireActual("./app/services/Live");

	return {
		__esModule: true,
		...originalModule,
		LiveSocketService: jest.fn().mockImplementation(() => ({
			initialiseSocket: jest.fn().mockResolvedValue(undefined),
			sendPing: jest.fn().mockResolvedValue(undefined),
			getTimeOffset: jest.fn().mockResolvedValue(undefined),
			pollLatency: jest.fn().mockResolvedValue(undefined),
			getFetchedDMs: jest.fn().mockResolvedValue([]),
			dmsAreConnected: jest.fn().mockResolvedValue(true),
			getSelf: jest.fn().mockResolvedValue(null),
			getInstance: jest.fn().mockReturnValue({
				initialiseSocket: jest.fn().mockResolvedValue(undefined),
				sendPing: jest.fn().mockResolvedValue(undefined),
				getTimeOffset: jest.fn().mockResolvedValue(undefined),
				pollLatency: jest.fn().mockResolvedValue(undefined),
				getFetchedDMs: jest.fn().mockResolvedValue([]),
				dmsAreConnected: jest.fn().mockResolvedValue(true),
				getSelf: jest.fn().mockResolvedValue(null),
			}),
			instanceExists: jest.fn().mockReturnValue(true),
		})),
	};
});

jest.mock("jwt-decode", () => ({
	...jest.requireActual("jwt-decode"), // import and retain the original functionalities
	decodeToken: jest.fn().mockReturnValue({
		/*
		iss?: string;
		sub?: string;
		aud?: string[] | string;
		exp?: number;
		nbf?: number;
		iat?: number;
		jti?: string;
		*/
		iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789",
		sub: "123456789",
		aud: "123456789",
		exp: Number.MAX_SAFE_INTEGER,
		nbf: Number.MAX_SAFE_INTEGER,
		iat: Number.MAX_SAFE_INTEGER,
		jti: "123456789",
	}),
}));
