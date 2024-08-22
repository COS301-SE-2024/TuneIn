export const mockConfigService = {
	get: jest.fn((key: string) => {
		switch (key) {
			case "AWS_S3_BUCKET_NAME":
				return "test-bucket";
			case "AWS_S3_REGION":
				return "test-region";
			case "AWS_S3_ENDPOINT":
				return "test-endpoint";
			case "AWS_COGNITO_CLIENT_ID":
				return "test-cognito-client-id";
			case "AWS_COGNITO_USER_POOL_ID":
				return "test-cognito-user-pool-id";
			case "AWS_ACCESS_KEY_ID":
				return "test-access-key-id";
			case "AWS_SECRET_ACCESS_KEY":
				return "test-secret-access-key";
			case "SPOTIFY_CLIENT_ID":
				return "test-spotify-client-id";
			case "SPOTIFY_CLIENT_SECRET":
				return "test-spotify-client-secret";
			case "SPOTIFY_REDIRECT_URI":
				return "test-spotify-redirect-uri";
			case "JWT_SECRET_KEY":
				return "test-jwt-secret";
			case "JWT_EXPIRATION_TIME":
				return "test-jwt-expiration-time";
			case "SALT":
				return "test-salt";
			default:
				return null;
		}
	}),
};

export const mockPrismaService = {
	$queryRaw: jest.fn(),
};

export const mockAuthService = {
	// mock properties and methods as needed
};

export const mockUsersService = {
	// mock properties and methods as needed
};
