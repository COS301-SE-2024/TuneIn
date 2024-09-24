import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MiniRoomCard from "../../app/components/rooms/MiniRoomCard"; // Adjust the import path as needed
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("MiniRoomCard", () => {
	const mockNavigate = jest.fn();
	const roomCard = {
		roomID: "1",
		backgroundImage: "https://example.com/image.jpg",
		name: "Sample Room",
		description: "This is a sample room description.",
		userProfile: "https://example.com/user.jpg",
		username: "SampleUser",
		isExplicit: false,
		start_date: new Date(new Date().getTime() - 1000), // Current time minus 1 second
		end_date: new Date(new Date().getTime() + 1000 * 60 * 60), // Current time plus 1 hour
		userID: "TestUser1", // Add missing property
		tags: [], // Add missing property
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders the MiniRoomCard correctly", () => {
		const { getByText } = render(<MiniRoomCard roomCard={roomCard} />);

		// Check if the room name is rendered
		expect(getByText(roomCard.name)).toBeTruthy();

		// Check if the room description is rendered
		expect(getByText(roomCard.description)).toBeTruthy();

		// Check if the username is rendered
		expect(getByText(roomCard.username)).toBeTruthy();
	});

	it("navigates to the room page when the card is pressed", () => {
		const { getByTestId } = render(<MiniRoomCard roomCard={roomCard} />);

		// Press the MiniRoomCard
		fireEvent.press(getByTestId("minicard"));

		// Check if the navigate function was called
		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/screens/rooms/RoomStack",
			params: { room: JSON.stringify(roomCard) },
		});
	});
});
