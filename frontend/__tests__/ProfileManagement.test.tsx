import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProfileManagement from "../app/screens/help/ProfileManagement";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("ProfileManagement", () => {
	const mockNavigate = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		useRouter.mockReturnValue({
			navigate: mockNavigate,
			back: mockBack,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders correctly", () => {
		const { getByText, getByTestId } = render(<ProfileManagement />);

		// Check if the header and title are rendered
		expect(getByTestId("back-button")).toBeTruthy();
		expect(getByText("Profile Management")).toBeTruthy();

		// Check if the Creating and Updating Your Profile card is rendered
		expect(getByText("Creating and Updating Your Profile")).toBeTruthy();

		// Check if the Music Preferences card is rendered
		expect(getByText("Music Preferences")).toBeTruthy();

		// Check if the Personalized Recommendations card is rendered
		expect(getByText("Personalized Recommendations")).toBeTruthy();

		// Check if the Analytics card is rendered
		expect(getByText("Analytics")).toBeTruthy();
	});

	test("navigates to the ProfilePage when the profile card is pressed", () => {
		const { getByText } = render(<ProfileManagement />);

		fireEvent.press(getByText("Creating and Updating Your Profile"));

		expect(mockNavigate).toHaveBeenCalledWith("../profile/ProfilePage");
	});

	test("navigates to the AnalyticsPage when the analytics card is pressed", () => {
		const { getByText } = render(<ProfileManagement />);

		fireEvent.press(getByText("Analytics"));

		expect(mockNavigate).toHaveBeenCalledWith("../analytics/AnalyticsPage");
	});

	test("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<ProfileManagement />);

		fireEvent.press(getByTestId("back-button"));

		expect(mockBack).toHaveBeenCalled();
	});
});
