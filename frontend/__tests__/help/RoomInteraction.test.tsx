import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import InteractiveSessions from "../../app/screens/help/RoomInteraction"; // Adjust the path
import { useRouter } from "expo-router";

// Mock useRouter from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("InteractiveSessions Component", () => {
	// Mock router
	const mockRouter = { back: jest.fn(), navigate: jest.fn() };

	beforeEach(() => {
		// Mock the return value of useRouter to return our mockRouter
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	afterEach(() => {
		jest.clearAllMocks(); // Clear mocks after each test
	});

	it("navigates back when the back button is pressed", () => {
		const { getByTestId } = render(<InteractiveSessions />);

		// Simulate pressing the back button
		fireEvent.press(getByTestId("back-button"));

		// Assert that mockRouter.back was called
		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("navigates to CreateRoom when the corresponding card is pressed", () => {
		const { getByText } = render(<InteractiveSessions />);

		// Simulate pressing the CreateRoom card
		fireEvent.press(getByText("Creating Rooms"));

		// Assert that mockRouter.navigate was called with the correct screen
		expect(mockRouter.navigate).toHaveBeenCalledWith("../rooms/CreateRoom");
	});

	it("navigates to Home when the corresponding card is pressed", () => {
		const { getByText } = render(<InteractiveSessions />);

		// Simulate pressing the CreateRoom card
		fireEvent.press(getByText("Joining Rooms"));

		// Assert that mockRouter.navigate was called with the correct screen
		expect(mockRouter.navigate).toHaveBeenCalledWith("../Home");
	});

	it("renders all the icons correctly", () => {
		const { getByTestId } = render(<InteractiveSessions />);

		// Check for icons by their testID
		expect(getByTestId("back-icon")).toBeTruthy();
		expect(getByTestId("door-open-icon")).toBeTruthy();
		expect(getByTestId("settings-icon")).toBeTruthy();
		expect(getByTestId("tools-icon")).toBeTruthy();
		expect(getByTestId("enter-outline-icon")).toBeTruthy();
		expect(getByTestId("bookmarks-icon")).toBeTruthy();
	});
});
