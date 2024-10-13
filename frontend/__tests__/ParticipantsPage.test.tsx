import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ParticipantsPage from "../app/screens/rooms/ParticipantsPage"; // Adjust the import path as needed
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
// Mock useNavigation from React Navigation
jest.mock("@react-navigation/native", () => ({
	useNavigation: jest.fn(),
}));

jest.mock("expo-router", () => ({
	useLocalSearchParams: jest.fn(),
	useRouter: jest.fn(),
}));

describe("ParticipantsPage", () => {
	const mockNavigate = jest.fn();
	const mockGoBack = jest.fn();

	beforeEach(() => {
		// Mock the navigation functions
		(useNavigation as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
			goBack: mockGoBack,
		});

		(useLocalSearchParams as jest.Mock).mockReturnValue({
			participants: JSON.stringify([
				{
					userID: "1",
					username: "user_1",
					profile_picture_url: "https://example.com/user1.jpg",
				},
				{
					userID: "2",
					username: "user_2_with_a_very_long_name",
					profile_picture_url: "https://example.com/user2.jpg",
				},
			]),
		});
	});

	const mockParticipants = [
		{
			id: "1",
			username: "user_1",
			profilePictureUrl: "https://example.com/user1.jpg",
		},
		{
			id: "2",
			username: "user_2_with_a_very_long_name",
			profilePictureUrl: "https://example.com/user2.jpg",
		},
	];

	it("should render participants correctly", () => {
		const { getByText } = render(
			<ParticipantsPage participants={mockParticipants} />,
		);

		// Check if both participants are rendered
		expect(getByText("user_1")).toBeTruthy();
		expect(getByText("user_2_with_a_ver...")).toBeTruthy();
	});

	it("should navigate back when the back button is pressed", () => {
		const { getByTestId } = render(
			<ParticipantsPage participants={mockParticipants} />,
		);

		// Simulate pressing the back button
		fireEvent.press(getByTestId("back-button"));

		// Check if goBack was called
		expect(mockGoBack).toHaveBeenCalled();
	});

	it("opens the context menu when the ellipsis button is pressed", () => {
		const { getByTestId, getByText, queryByText } = render(
			<ParticipantsPage participants={mockParticipants} />,
		);

		const optionsButton = getByTestId("ellipsis-button-1"); // Assuming you add testID for ellipsis buttons
		fireEvent.press(optionsButton);

		// Check if the context menu modal is displayed
		expect(getByText("Ban user_1?")).toBeTruthy();
	});

	it("sets the selected participant and shows the context menu", () => {
		const { getByTestId, getByText } = render(
			<ParticipantsPage participants={mockParticipants} />,
		);

		const optionsButton = getByTestId("ellipsis-button-2");
		fireEvent.press(optionsButton);

		// Expect the modal to show the correct truncated username
		expect(getByText("Ban user_2_with_a_ver...?")).toBeTruthy();
	});

	it("bans the selected user and closes the context menu", () => {
		console.log = jest.fn(); // Mock console.log to check if it's called
		const { getByTestId, getByText, queryByText } = render(
			<ParticipantsPage participants={mockParticipants} />,
		);

		const optionsButton = getByTestId("ellipsis-button-1");
		fireEvent.press(optionsButton);

		const banButton = getByText("Ban User");
		fireEvent.press(banButton);

		// Check if the user was banned
		expect(console.log).toHaveBeenCalledWith("Banning user: user_1");

		// Check if the modal is closed
		expect(queryByText("Ban user_1?")).toBeNull();
	});
});
