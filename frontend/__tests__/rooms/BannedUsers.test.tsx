import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BannedUsers from "../../app/screens/rooms/BannedUsers"; // Updated import statement
import { useNavigation } from "@react-navigation/native";

// Mock the navigation
jest.mock("@react-navigation/native", () => ({
	useNavigation: jest.fn(),
}));

describe("BannedUsers Component", () => {
	const mockNavigate = jest.fn();
	beforeEach(() => {
		(useNavigation as jest.Mock).mockReturnValue({ goBack: mockNavigate });
	});

	it("renders the header and back button", () => {
		const { getByText, getByTestId } = render(<BannedUsers />);

		// Check if header text is present
		expect(getByText("Banned Users")).toBeTruthy();
		// Check if the back button is rendered
		expect(getByTestId("back-button")).toBeTruthy();
	});

	it("renders the list of banned users", () => {
		const { getByText } = render(<BannedUsers />);

		// Check if each user's username is rendered
		expect(getByText("john_doe_123")).toBeTruthy();
		expect(getByText("jane_smith_456")).toBeTruthy();
		expect(getByText("sam_wilson_789")).toBeTruthy();
	});

	it("shows a message when there are no banned users", () => {
		// Modify the BannedUsers component to accept a prop for testing
		const { getByText } = render(<BannedUsers bannedUsers={[]} />);

		// Check if the empty queue message is rendered
		expect(getByText("This room has no banned users.")).toBeTruthy();
	});

	it("opens context menu when ellipsis is clicked", () => {
		const { getByText, getByTestId } = render(<BannedUsers />);

		// Click on the ellipsis icon of the first user using testID
		fireEvent.press(getByTestId("ellipsis-1")); // Use the appropriate testID based on the user's ID

		// Check if the modal is displayed
		expect(getByText("Unban john_doe_123?")).toBeTruthy();
	});

	it("calls handleUnbanUser function when unban button is pressed", () => {
		const { getByText, getByTestId } = render(<BannedUsers />);

		// Open the context menu by clicking the ellipsis
		fireEvent.press(getByTestId("ellipsis-1")); // Use the appropriate testID based on the user's ID

		// Press the unban button
		fireEvent.press(getByText("Unban User"));

		// Assert that the unban logic (console log in this case) is called
		// You can spy on console.log or mock a function for more realistic testing
	});

	it("closes the context menu when cancel button is pressed", () => {
		const { getByText, queryByText, getByTestId } = render(<BannedUsers />);

		// Open the context menu by clicking the ellipsis
		fireEvent.press(getByTestId("ellipsis-1")); // Use the appropriate testID based on the user's ID

		// Press the cancel button
		fireEvent.press(getByText("Cancel"));

		// Assert that the modal is closed
		expect(queryByText("Unban john_doe_123?")).toBeFalsy();
	});
});
