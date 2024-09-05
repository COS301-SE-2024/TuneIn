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
	$queryRawUnsafe: jest.fn(),
	authentication: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	banned: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	blocked: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	bookmark: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	chat_reactions: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	follows: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	friends: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	genre: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	message: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	participate: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	playlist: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	private_message: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	private_room: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	public_room: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	queue: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	room: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	room_message: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	scheduled_room: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	search_history: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	search_suggestions: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	song: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	table_state: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	user_activity: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
	users: {
		create: jest.fn(),
		createMany: jest.fn(),
		createManyAndReturn: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
		findUniqueOrThrow: jest.fn(),
		findFirst: jest.fn(),
		findFirstOrThrow: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
		upsert: jest.fn(),
	},
};

export const mockDtoGenService = {
	generateMultipleRoomDto: jest.fn(),
	generateMultipleUserDto: jest.fn(),
	// mock properties and methods as needed
};

export const mockAuthService = {
	// mock properties and methods as needed
};

export const mockUsersService = {
	// mock properties and methods as needed
};

export const mockDbUtilsService = {
	getFriendRequests: jest.fn(),
	userExists: jest.fn(),
	isFollowing: jest.fn(),
	// mock properties and methods as needed
};
