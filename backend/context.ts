import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export type Context = {
	prisma: PrismaClient;
};

export type MockContext = {
	prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
	return {
		prisma: mockDeep<PrismaClient>(),
	};
};

export const createRealContext = (): Context => {
	return {
		prisma: new PrismaClient(),
	};
};
