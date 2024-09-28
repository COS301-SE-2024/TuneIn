import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProfileManagement from "../../app/screens/help/ProfileManagement"; // Adjust the path as needed
import { useRouter } from "expo-router";

// Mock useRouter from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("ProfileManagement Component", () => {
	const mockRouter = { back: jest.fn(), navigate: jest.fn() };

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	it("renders correctly with all elements", () => {
		const { getByText } = render(<ProfileManagement />);

		// Check for header title
		expect(getByText("Profile Management")).toBeTruthy();

		// Check for card titles
		expect(getByText("Creating and Updating Your Profile")).toBeTruthy();
		expect(getByText("Music Preferences")).toBeTruthy();
		expect(getByText("Personalized Recommendations")).toBeTruthy();
		expect(getByText("Analytics")).toBeTruthy();
	});

	it("navigates back when the back button is pressed", () => {
		const { getByTestId } = render(<ProfileManagement />);
		const backButton = getByTestId("back-button");

		// Simulate back button press
		fireEvent.press(backButton);

		// Verify router.back() was called
		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("navigates to the Analytics page when the Analytics card is pressed", () => {
		const { getByText } = render(<ProfileManagement />);
		const analyticsCard = getByText("Analytics");

		// Simulate Analytics card press
		fireEvent.press(analyticsCard);

		// Verify router.navigate() was called with the correct path
		expect(mockRouter.navigate).toHaveBeenCalledWith(
			"../analytics/AnalyticsPage",
		);
	});

	it("renders correct icons for each card", () => {
		const { getByTestId } = render(<ProfileManagement />);

		// Check for icons by their testID
		expect(getByTestId("edit-icon")).toBeTruthy();
		expect(getByTestId("music-icon")).toBeTruthy();
		expect(getByTestId("heart-icon")).toBeTruthy();
		expect(getByTestId("analytics-icon")).toBeTruthy();
	});
});
