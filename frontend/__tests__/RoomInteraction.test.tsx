import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import InteractiveSessions from "../app/screens/messaging/help/RoomInteraction";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("InteractiveSessions", () => {
	const mockNavigate = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		useRouter.mockReturnValue({
			navigate: mockNavigate,
			back: mockBack,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders correctly", () => {
		const { getByText, getByTestId } = render(<InteractiveSessions />);

		// Check if the header and title are rendered
		expect(getByTestId("back-button")).toBeTruthy();
		expect(getByText("Interactive Sessions/Rooms")).toBeTruthy();

		// Check if the Creating Rooms card is rendered
		expect(getByText("Creating Rooms")).toBeTruthy();

		// Check if the Room Settings card is rendered
		expect(getByText("Room Settings")).toBeTruthy();

		// Check if the Managing Rooms card is rendered
		expect(getByText("Managing Rooms")).toBeTruthy();

		// Check if the Joining Rooms card is rendered
		expect(getByText("Joining Rooms")).toBeTruthy();

		// Check if the Bookmarking Rooms card is rendered
		expect(getByText("Bookmarking Rooms")).toBeTruthy();
	});

	test("navigates to the CreateRoom screen when the Creating Rooms card is pressed", () => {
		const { getByText } = render(<InteractiveSessions />);

		fireEvent.press(getByText("Creating Rooms"));

		expect(mockNavigate).toHaveBeenCalledWith("../rooms/CreateRoom");
	});

	test("navigates to the Home screen when the Joining Rooms card is pressed", () => {
		const { getByText } = render(<InteractiveSessions />);

		fireEvent.press(getByText("Joining Rooms"));

		expect(mockNavigate).toHaveBeenCalledWith("../Home");
	});

	test("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<InteractiveSessions />);

		fireEvent.press(getByTestId("back-button"));

		expect(mockBack).toHaveBeenCalled();
	});
});
