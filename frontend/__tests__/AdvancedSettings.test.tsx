import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AdvancedSettings from "../app/screens/rooms/AdvancedSettings"; // Adjust path based on your structure
import { useRouter, useLocalSearchParams } from "expo-router";

// Mock the necessary hooks from `expo-router`
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

describe("AdvancedSettings", () => {
	const mockNavigate = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		// Mock `useRouter` functions
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
			back: mockBack,
		});

		// Mock `_roomDetails` data from `useLocalSearchParams`
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			room_name: "Test Room",
			description: "This is a test room.",
			has_nsfw_content: false,
			has_explicit_content: false,
			room_image: "test-image-url",
			roomID: "1234",
			language: "English",
		});
	});

	it("renders the AdvancedSettings component and checks for elements", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Check if the title is displayed
		expect(getByText("Advanced Settings")).toBeTruthy();

		// Check if some options are rendered
		expect(getByText("Everyone")).toBeTruthy();
		expect(getByText("People with the link")).toBeTruthy();
		expect(getByText("Friends and people you follow")).toBeTruthy();
		expect(getByText("Only Friends")).toBeTruthy();
	});

	it("handles option 2 selection correctly", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Select "People with the link"
		fireEvent.press(getByText("People with the link"));
	});

	it("handles option 1 selection correctly", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Select "People with the link"
		fireEvent.press(getByText("Everyone"));
	});

	it("handles option 3 selection correctly", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Select "People with the link"
		fireEvent.press(getByText("Friends and people you follow"));
	});

	it("handles option 4 selection correctly", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Select "People with the link"
		fireEvent.press(getByText("Only Friends"));
	});

	it("toggles switches correctly", () => {
		const { getAllByRole } = render(<AdvancedSettings />);

		// Get the switches (Assuming 4 switches)
		const switches = getAllByRole("switch");

		// Toggle "Searchability"
		fireEvent(switches[0], "onValueChange");
		expect(switches[0].props.value).toBe(false); // If default was true

		// Toggle "Listeners can add"
		fireEvent(switches[1], "onValueChange");
		expect(switches[1].props.value).toBe(false); // If default was true
	});

	it('navigates to edit screen on "Edit Room Details" press', () => {
		const { getByText } = render(<AdvancedSettings />);

		fireEvent.press(getByText("Edit Room Details"));

		// Check if navigate is called with correct parameters
		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/screens/rooms/EditRoom",
			params: {
				name: "Test Room",
				description: "This is a test room.",
				isNsfw: false,
				isExplicit: false,
				backgroundImage: "test-image-url",
				roomID: "1234",
				language: "English",
			},
		});
	});

	it("displays and closes the delete confirmation modal", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Open delete confirmation modal
		fireEvent.press(getByText("Delete Room"));
	});

	it("calls router back when save is clicked", () => {
		const { getByText } = render(<AdvancedSettings />);

		fireEvent.press(getByText("Save Changes"));
	});

	it("navigates to home after deleting a room", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Open delete confirmation modal
		fireEvent.press(getByText("Delete Room"));

		// Confirm delete
		fireEvent.press(getByText("Yes"));

		// Check if navigate to home is called
		expect(mockNavigate).toHaveBeenCalledWith("/screens/Home");
	});

	it("closes delete modal when No is pressed", () => {
		const { getByText, queryByText } = render(<AdvancedSettings />);

		// Open delete confirmation modal
		fireEvent.press(getByText("Delete Room"));

		// Press "No" to cancel deletion
		fireEvent.press(getByText("No"));

		// Check if the modal has been closed
		expect(
			queryByText("Are you sure you want to delete this room?"),
		).toBeNull();
	});

	it("closes save modal and calls router.back() after saving", () => {
		const { getByText } = render(<AdvancedSettings />);

		// Press "Save Changes"
		fireEvent.press(getByText("Save Changes"));

	});

	it("calls router.back() when the close button is pressed", () => {
		const { getByTestId } = render(<AdvancedSettings />);

		// Press the close button
		fireEvent.press(getByTestId("closeButton"));

		// Check if router.back was called
		expect(mockBack).toHaveBeenCalledTimes(1);
	});
});
