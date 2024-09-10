import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GettingStarted from "../app/screens/help/RoomCollaboration";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("RoomCollaboration", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		useRouter.mockReturnValue({
			back: mockBack,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders correctly", () => {
		const { getByText, getByTestId } = render(<GettingStarted />);

		// Check if the header and title are rendered
		expect(getByTestId("back-button")).toBeTruthy();
		expect(getByText("Room Collaboration")).toBeTruthy();

		// Check if the Chat card is rendered
		expect(getByText("Chat")).toBeTruthy();

		// Check if the Reactions card is rendered
		expect(getByText("Reactions")).toBeTruthy();

		// Check if the Add To The Playlist card is rendered
		expect(getByText("Add To The Playlist")).toBeTruthy();

		// Check if the SongVote card is rendered
		expect(getByText("SongVote")).toBeTruthy();
	});

	test("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<GettingStarted />);

		fireEvent.press(getByTestId("back-button"));

		expect(mockBack).toHaveBeenCalled();
	});
});
