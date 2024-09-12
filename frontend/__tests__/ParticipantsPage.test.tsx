import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ParticipantsPage from "../app/screens/rooms/ParticipantsPage"; // Adjust the import path as needed
import { useNavigation } from "@react-navigation/native";

// Mock useNavigation from React Navigation
jest.mock("@react-navigation/native", () => ({
	useNavigation: jest.fn(),
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
	});

	const mockParticipants = [
		{
			id: "1",
			username: "JohnDoe",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "2",
			username: "JaneSmith",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
	];

	it("should render participants correctly", () => {
		const { getByText } = render(
			<ParticipantsPage participants={mockParticipants} />,
		);

		// Check if both participants are rendered
		expect(getByText("JohnDoe")).toBeTruthy();
		expect(getByText("JaneSmith")).toBeTruthy();
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
});
