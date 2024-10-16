import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoomModal from "../../app/components/RoomModal"; // Update the path accordingly

describe("RoomModal Component", () => {
	const mockOnClose = jest.fn();
	const mockOnViewChildRooms = jest.fn();

	afterEach(() => {
		jest.clearAllMocks(); // Clear mocks after each test to avoid interference
	});

	it("renders the modal with the correct text", () => {
		const { getByText } = render(
			<RoomModal
				visible={true}
				onClose={mockOnClose}
				onViewChildRooms={mockOnViewChildRooms}
			/>,
		);

		// Check if modal text is displayed correctly
		expect(getByText("This Room Has Been Split")).toBeTruthy();
		expect(
			getByText("Would you like to view child rooms or stay in this room?"),
		).toBeTruthy();
	});

	it("calls onViewChildRooms when 'View Sub Rooms' button is pressed", () => {
		const { getByText } = render(
			<RoomModal
				visible={true}
				onClose={mockOnClose}
				onViewChildRooms={mockOnViewChildRooms}
			/>,
		);

		// Press the 'View Sub Rooms' button
		fireEvent.press(getByText("View Sub Rooms"));

		// Check if onViewChildRooms function is called
		expect(mockOnViewChildRooms).toHaveBeenCalled();
	});

	it("calls onClose when 'Stay in Room' button is pressed", () => {
		const { getByText } = render(
			<RoomModal
				visible={true}
				onClose={mockOnClose}
				onViewChildRooms={mockOnViewChildRooms}
			/>,
		);

		// Press the 'Stay in Room' button
		fireEvent.press(getByText("Stay in Room"));

		// Check if onClose function is called
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("does not render the modal when not visible", () => {
		const { queryByText } = render(
			<RoomModal
				visible={false}
				onClose={mockOnClose}
				onViewChildRooms={mockOnViewChildRooms}
			/>,
		);

		// Ensure modal is not rendered when visible is false
		expect(queryByText("This Room Has Been Split")).toBeFalsy();
	});
});
