import React from "react";
import { render } from "@testing-library/react-native";
import MyRooms from "../../app/screens/rooms/MyRooms"; // Adjust the path as needed
import { useLocalSearchParams } from "expo-router";

// Mocking necessary modules
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock RoomCardWidget to simplify tests
jest.mock("../../app/components/rooms/RoomCardWidget", () => "RoomCardWidget");

// Mock data for rooms
const mockRooms = JSON.stringify([
	{
		roomID: "1",
		name: "Room 1",
		description: "Description 1",
		start_date: "2024-01-01T00:00:00Z",
		end_date: "2024-01-10T00:00:00Z",
	},
	{
		roomID: "2",
		name: "Room 2",
		description: "Description 2",
		start_date: "2024-02-01T00:00:00Z",
		end_date: "2024-02-10T00:00:00Z",
	},
]);

describe("MyRooms", () => {
	beforeEach(() => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ myRooms: mockRooms });
	});

	it("renders the MyRooms screen correctly", () => {
		const { getByText } = render(<MyRooms />);

		// Check if the page title is rendered
		expect(getByText("My Rooms")).toBeTruthy();

		// Ensure that rooms are rendered after loading
		expect(getByText("January 2024")).toBeTruthy();
		expect(getByText("February 2024")).toBeTruthy();
	});
});
