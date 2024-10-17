import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoomCollaboration from "../../app/screens/help/RoomCollaboration";
import { useRouter } from "expo-router";

// Mock the router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("RoomCollaboration Component", () => {
	let mockRouter;

	beforeEach(() => {
		mockRouter = {
			back: jest.fn(),
		};
		useRouter.mockReturnValue(mockRouter);
	});

	it("renders correctly", () => {
		const { getByText } = render(<RoomCollaboration />);

		expect(getByText("Room Collaboration")).toBeTruthy();
		expect(getByText("Chat")).toBeTruthy();
		expect(getByText("Reactions")).toBeTruthy();
		expect(getByText("Add To The Playlist")).toBeTruthy();
		// expect(getByText("Voting")).toBeTruthy();
	});

	it("navigates back when the back button is pressed", () => {
		const { getByTestId } = render(<RoomCollaboration />);
		const backButton = getByTestId("back-button");

		fireEvent.press(backButton);

		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("renders correct icons for each card", () => {
		const { getByTestId } = render(<RoomCollaboration />);

		// Check for icons by their testID
		expect(getByTestId("chat-icon")).toBeTruthy();
		expect(getByTestId("reactions-icon")).toBeTruthy();
		expect(getByTestId("playlist-icon")).toBeTruthy();
		// expect(getByTestId("voting-icon")).toBeTruthy();
	});
});
