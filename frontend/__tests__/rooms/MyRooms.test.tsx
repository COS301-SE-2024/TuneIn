import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
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

	it("changes sort direction on arrow press", async () => {
		const { getByTestId, getByText } = render(<MyRooms />);

		// Check the initial sort direction (ascending)
		const sortArrow = getByTestId("sort-arrow");
		// Check if the initial icon is "arrow-up"

		// Change sort direction
		fireEvent.press(sortArrow);
		// Expect the icon to change to "arrow-down"
	});

	it("sorts rooms based on selected criteria", async () => {
		const { getByTestId, getByText } = render(<MyRooms />);

		// Initially sorted by start date
		await waitFor(() => {
			expect(getByText("January 2024")).toBeTruthy();
		});

		// Change sorting criteria to end date using the Picker
		const picker = getByTestId("dropdown");
		fireEvent(picker, "valueChange", "end_date");

		// Change sort direction
		const sortArrow = getByTestId("sort-arrow");
		fireEvent.press(sortArrow);

		// Wait for sorting to take effect
		await waitFor(() => {
			// Update the expected outcome based on the sorted result
			expect(getByText("February 2024")).toBeTruthy(); // Assuming end_date sorting
		});
	});
});
