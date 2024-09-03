import { TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { createAuthTestingModule } from "../../jest_mocking/module-mocking";
import { UnauthorizedException } from "@nestjs/common";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { mockPrismaService } from "../../jest_mocking/service-mocking";

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await createAuthTestingModule();
		service = module.get<AuthService>(AuthService);
	});

	describe("listUsers", () => {
		it("should return a list of users", async () => {
			// Mock the response from CognitoIdentityProvider.listUsers
			const mockListUsers = jest.fn().mockResolvedValue({
				Users: [
					{
						Username: "user1",
						UserAttributes: [
							{ Name: "email", Value: "user1@example.com" },
							{ Name: "phone_number", Value: "+1234567890" },
						],
					},
					{
						Username: "user2",
						UserAttributes: [
							{ Name: "email", Value: "user2@example.com" },
							{ Name: "phone_number", Value: "+9876543210" },
						],
					},
				],
			});
			service["cognitoIdentityServiceProvider"].listUsers = mockListUsers;

			const result = await service.listUsers();

			expect(result).toBeDefined();
			expect(result.Users).toHaveLength(2);

			expect(mockListUsers).toHaveBeenCalledTimes(1);
			expect(mockListUsers).toHaveBeenCalledWith({
				UserPoolId: service["userPoolId"],
			});
		});

		it("should throw an error when listing users fails", async () => {
			// Mock the response from CognitoIdentityProvider.listUsers to throw an error
			const mockListUsers = jest
				.fn()
				.mockRejectedValue(new Error("Failed to list users"));
			service["cognitoIdentityServiceProvider"].listUsers = mockListUsers;

			await expect(service.listUsers()).rejects.toThrow(UnauthorizedException);

			expect(mockListUsers).toHaveBeenCalledTimes(1);
			expect(mockListUsers).toHaveBeenCalledWith({
				UserPoolId: service["userPoolId"],
			});
		});
	});
	describe("createUser", () => {
		it("should return true if user already exists", async () => {
			// Mock the existing user
			const mockExistingUser = jest.fn().mockResolvedValue({
				username: "testuser",
				email: "testuser@example.com",
				user_id: "123456",
			});
			service["prisma"].users.findUnique = mockExistingUser;
			const result = await service.createUser(
				"testuser",
				"testuser@example.com",
				"123456",
			);
			expect(result).toBe(true);
			expect(mockExistingUser).toHaveBeenCalledTimes(1);
			expect(mockExistingUser).toHaveBeenCalledWith({
				where: { user_id: "123456" },
			});
		});

		it("should create a new user and return true", async () => {
			// Mock the response from Prisma
			const mockCreateUser = jest.fn().mockResolvedValue({
				username: "testuser",
				email: "testuser@example.com",
				user_id: "123456",
			});
			service["prisma"].users.create = mockCreateUser;
			jest.spyOn(mockPrismaService.users, "findUnique").mockResolvedValue(null);
			const result = await service.createUser(
				"testuser",
				"testuser@example.com",
				"123456",
			);
			expect(result).toBe(true);
			expect(mockCreateUser).toHaveBeenCalledTimes(1);
			expect(mockCreateUser).toHaveBeenCalledWith({
				data: {
					username: "testuser",
					email: "testuser@example.com",
					user_id: "123456",
				},
			});
		});

		it("should return false if an error occurs", async () => {
			// Mock the error from Prisma
			const mockCreateUser = jest
				.fn()
				.mockRejectedValue(new Error("Failed to create user"));
			service["prisma"].users.create = mockCreateUser;
			jest.spyOn(mockPrismaService.users, "findUnique").mockResolvedValue(null);
			const result = await service.createUser(
				"testuser",
				"testuser@example.com",
				"123456",
			);
			expect(result).toBe(false);
			expect(mockCreateUser).toHaveBeenCalledTimes(1);
			expect(mockCreateUser).toHaveBeenCalledWith({
				data: {
					username: "testuser",
					email: "testuser@example.com",
					user_id: "123456",
				},
			});
		});
	});
	describe("decodeAndVerifyCognitoJWT", () => {
		it("should decode and verify a valid Cognito JWT token", async () => {
			// Mock the response from CognitoJwtVerifier.verify
			const mockVerify = jest.fn().mockResolvedValue({
				sub: "1234567890",
				iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789",
				client_id: "abcdefghijklmnopqrstuvwxyz",
				origin_jti: "abcdefghijklmnopqrstuvwxyz",
				event_id: "abcdefghijklmnopqrstuvwxyz",
				token_use: "access",
				scope: "aws.cognito.signin.user.admin",
				auth_time: 1631234567,
				exp: 1631234567,
				iat: 1631234567,
				jti: "abcdefghijklmnopqrstuvwxyz",
				username: "testuser",
			});
			CognitoJwtVerifier.create = jest.fn().mockReturnValue({
				verify: mockVerify,
			});

			const jwt_token = "valid-jwt-token";
			const result = await service.decodeAndVerifyCognitoJWT(jwt_token);

			expect(result).toBeDefined();
			expect(result.sub).toBe("1234567890");
			expect(result.iss).toBe(
				"https://cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789",
			);
			expect(result.client_id).toBe("abcdefghijklmnopqrstuvwxyz");
			expect(result.origin_jti).toBe("abcdefghijklmnopqrstuvwxyz");
			expect(result.event_id).toBe("abcdefghijklmnopqrstuvwxyz");
			expect(result.token_use).toBe("access");
			expect(result.scope).toBe("aws.cognito.signin.user.admin");
			expect(result.auth_time).toBe(1631234567);
			expect(result.exp).toBe(1631234567);
			expect(result.iat).toBe(1631234567);
			expect(result.jti).toBe("abcdefghijklmnopqrstuvwxyz");
			expect(result.username).toBe("testuser");

			expect(CognitoJwtVerifier.create).toHaveBeenCalledTimes(1);
			expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
				userPoolId: service["userPoolId"],
				tokenUse: "access",
				clientId: service["clientId"],
			});
			expect(mockVerify).toHaveBeenCalledTimes(1);
			expect(mockVerify).toHaveBeenCalledWith(jwt_token);
		});

		it("should throw an error for an invalid Cognito JWT token", async () => {
			// Mock the response from CognitoJwtVerifier.verify to throw an error
			const mockVerify = jest
				.fn()
				.mockRejectedValue(new Error("Invalid token"));
			CognitoJwtVerifier.create = jest.fn().mockReturnValue({
				verify: mockVerify,
			});

			const jwt_token = "invalid-jwt-token";
			await expect(
				service.decodeAndVerifyCognitoJWT(jwt_token),
			).rejects.toThrow(UnauthorizedException);

			expect(CognitoJwtVerifier.create).toHaveBeenCalledTimes(1);
			expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
				userPoolId: service["userPoolId"],
				tokenUse: "access",
				clientId: service["clientId"],
			});
			expect(mockVerify).toHaveBeenCalledTimes(1);
			expect(mockVerify).toHaveBeenCalledWith(jwt_token);
		});
	});
});
