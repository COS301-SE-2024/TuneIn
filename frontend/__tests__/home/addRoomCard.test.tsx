import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import AddRoomCard from "../../app/components/home/addRoomCard"; // Adjust the import path as necessary

// Mock the useRouter hook from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("AddRoomCard", () => {
	const navigateMock = jest.fn();

	beforeEach(() => {
		// Reset the mock before each test
		navigateMock.mockClear();
		(useRouter as jest.Mock).mockReturnValue({
			navigate: navigateMock,
		});
	});

	it("renders correctly", () => {
		const { getByText, getByTestId } = render(<AddRoomCard />);
		const container = getByTestId("add-room-card-container");
		const plusSign = getByText("+");

		expect(container).toBeTruthy();
		expect(plusSign).toBeTruthy();
	});

	it("navigates to the correct route on press", () => {
		const { getByTestId } = render(<AddRoomCard />);
		const touchable = getByTestId("add-room-card-touchable");

		fireEvent.press(touchable);
		expect(navigateMock).toHaveBeenCalledWith("screens/rooms/CreateRoom");
	});
});
