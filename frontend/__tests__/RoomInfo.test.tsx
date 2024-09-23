import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoomInfoScreen from "../app/screens/rooms/RoomInfo";
import { useRouter, useLocalSearchParams } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock Ionicons from @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
	const { Text } = require("react-native");
	return {
		Ionicons: ({ name }: { name: string }) => {
			return <Text>{name}</Text>; // Mock icon as simple text for testing
		},
	};
});

describe("RoomInfoScreen", () => {
	const mockBack = jest.fn();
	const roomDetails = {
		roomID: "2",
		backgroundImage:
			"https://as2.ftcdn.net/v2/jpg/05/72/82/85/1000_F_572828530_ofzCYowQVnlOwkcoBJnZqT36klbJzWdn.jpg",
		name: "Private Room",
		description: "A private room with restricted content.",
		genre: "Adult",
		language: "English",
		tags: [],
		isExplicit: true,
		userID: "Test-User2",
		isNsfw: true,
		start_date: new Date(),
		end_date: new Date(),
	};

	beforeEach(() => {
		// Mock the router back function
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			room: JSON.stringify(roomDetails), // Correctly mock the room param
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders the RoomInfoScreen correctly", () => {
		const { getByText, getByTestId } = render(<RoomInfoScreen />);

		// Check if the room name is rendered
		expect(getByText(roomDetails.name)).toBeTruthy();

		// Check if the RoomDetails component is rendered with correct props
		expect(getByTestId("room-details")).toBeTruthy();
	});

	it("calls router.back when the close button is pressed", () => {
		const { getByText } = render(<RoomInfoScreen />);

		// Press the close button (mocked Ionicon close icon)
		fireEvent.press(getByText("close")); // Assuming you see the text "close" from the mocked icon

		// Check if router.back was called
		expect(mockBack).toHaveBeenCalledTimes(1);
	});
});
