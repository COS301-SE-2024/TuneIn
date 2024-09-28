import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GettingStarted from "../../app/screens/help/GettingStarted"; // Adjust path as needed
import { useRouter } from "expo-router";
import {
	FontAwesome,
	MaterialCommunityIcons,
	Ionicons,
	AntDesign,
} from "@expo/vector-icons";

// Mock the useRouter hook from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("GettingStarted Component", () => {
	const mockRouter = { back: jest.fn() };

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	it("renders the component correctly", () => {
		const { getByText } = render(<GettingStarted />);

		// Check for header text
		expect(getByText("Getting Started")).toBeTruthy();

		// Check for card titles
		expect(getByText("Introduction")).toBeTruthy();
		expect(getByText("About")).toBeTruthy();
		expect(getByText("Creating an Account")).toBeTruthy();
		expect(getByText("Logging In")).toBeTruthy();
	});

	it("navigates back when the back button is pressed", () => {
		const { getByTestId } = render(<GettingStarted />);
		const backButton = getByTestId("back-button");

		// Simulate back button press
		fireEvent.press(backButton);

		// Verify that router.back was called
		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("renders correct icons for each card", () => {
		const { getByTestId } = render(<GettingStarted />);

		// Check for icons by their testID
		expect(getByTestId("music-icon")).toBeTruthy();
		expect(getByTestId("info-icon")).toBeTruthy();
		expect(getByTestId("account-icon")).toBeTruthy();
		expect(getByTestId("login-icon")).toBeTruthy();
	});
});
