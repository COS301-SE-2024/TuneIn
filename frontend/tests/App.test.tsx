import React from "react";
import renderer from "react-test-renderer";
import App from "../app/index"; // Adjust the path as necessary to point to your index.tsx
import * as StorageService from "../app/services/StorageService";
import { useRouter } from "expo-router";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

jest.mock("expo-router", () => {
	const actualModule = jest.requireActual("expo-router");
	return {
		...actualModule,
		useRouter: jest.fn(() => ({
			push: jest.fn(),
			back: jest.fn(),
		})),
	};
});

jest.mock("../app/services/StorageService", () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
}));

describe("<App />", () => {
	it("renders the Home component correctly", () => {
		(StorageService.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
		const tree = renderer.create(<App />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("Home component has 3 children", () => {
		(StorageService.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
		const tree = renderer.create(<App />).toJSON();
		expect(tree.children.length).toBe(3);
	});
});
