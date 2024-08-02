import React from "react";
import { render, act, fireEvent } from "@testing-library/react-native";
import NavBar from "../app/components/NavBar"; // Adjust the import path as per your project structure

// Mock useRouter function
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

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

describe("NavBar component", () => {
	const mockRouter = {
		navigate: jest.fn(),
	};

	beforeEach(() => {
		(require("expo-router") as any).useRouter.mockReturnValue(mockRouter);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders tabs correctly and navigates on press", async () => {
		const { getByText } = render(<NavBar />);

		// Find elements by their text content or accessible labels
		const helpTab = getByText("Help");

		// expect(testTab).toBeTruthy();
		expect(helpTab).toBeTruthy();

		act(() => {
			fireEvent.press(helpTab);
		});

		expect(mockRouter.navigate).toHaveBeenCalledWith(
			"/screens/help/HelpScreen",
		);
	});
});
