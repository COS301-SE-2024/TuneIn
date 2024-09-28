import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FriendsFollowing from "../../app/screens/help/FriendsFollowing"; // Adjust the path as needed
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock the useRouter hook from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("FriendsFollowing Component", () => {
	const mockRouter = { back: jest.fn() };

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	it("renders the component correctly", () => {
		const { getByText, getByTestId } = render(<FriendsFollowing />);

		// Check for header text
		expect(getByText("Friends and Following")).toBeTruthy();

		// Check for 'Following' and 'Friends' card titles
		expect(getByText("Following")).toBeTruthy();
		expect(getByText("Friends")).toBeTruthy();
	});

	it("navigates back when the back button is pressed", () => {
		const { getByTestId } = render(<FriendsFollowing />);
		const backButton = getByTestId("back-button");

		fireEvent.press(backButton);

		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("renders correct icons for following and friends cards", () => {
		const { getByTestId } = render(<FriendsFollowing />);

		// Check for Ionicons back icon (use a testID)
		expect(getByTestId("back-button")).toBeTruthy();

		// Check for SimpleLineIcons 'user-follow' icon by testID or accessibilityLabel
		expect(getByTestId("following-icon")).toBeTruthy();

		// Check for FontAwesome5 'user-friends' icon by testID or accessibilityLabel
		expect(getByTestId("friends-icon")).toBeTruthy();
	});
});
