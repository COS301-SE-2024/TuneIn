import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ParticipantsPage from "../app/screens/rooms/ParticipantsPage"; // Adjust the import path as needed
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAPI } from "../app/APIContext";
import { useLive } from "../app/LiveContext";

// Mocking external hooks
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("../app/APIContext", () => ({
	useAPI: jest.fn(),
}));

jest.mock("../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(() => ({ roomID: "room123" })), // Mock roomID
}));

describe("ParticipantsPage", () => {
	let mockRouter: { back: any }, mockRooms, mockRoomID, mockLiveContext;

	beforeEach(() => {
		// Setup mock for router
		mockRouter = { back: jest.fn() };
		(useRouter as jest.Mock).mockReturnValue(mockRouter);

		// Mock API context
		mockRooms = {
			getRoomUsers: jest.fn().mockResolvedValue({
				data: [
					{ userID: "1", username: "user1", profile_picture_url: "" },
					{
						userID: "2",
						username: "longusername_exce...",
						profile_picture_url: "",
					},
				],
			}),
		};
		(useAPI as jest.Mock).mockReturnValue({ rooms: mockRooms });

		// Mock Live context
		mockLiveContext = {
			currentRoom: null,
			roomParticipants: [],
		};
		(useLive as jest.Mock).mockReturnValue(mockLiveContext);

		// Mock roomID param
		mockRoomID = "room123";
	});

	it("renders correctly and displays participants", async () => {
		const { findByText, getByTestId } = render(<ParticipantsPage />);

		// Verify the component renders with participants
		expect(await findByText("user1")).toBeTruthy();
		expect(await findByText("longusername_exce...")).toBeTruthy();

		// Check back button exists
		expect(getByTestId("back-button")).toBeTruthy();
	});

	it("navigates back when back button is pressed", () => {
		const { getByTestId } = render(<ParticipantsPage />);

		// Simulate pressing back button
		fireEvent.press(getByTestId("back-button"));

		// Check if router.back() was called
		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("shows context menu when ellipsis button is pressed", async () => {
		const { findByTestId, findByText } = render(<ParticipantsPage />);

		// Wait for the ellipsis button to appear
		const ellipsisButton = await findByTestId("ellipsis-button-1");

		// Press the ellipsis button for user1
		fireEvent.press(ellipsisButton);

		// Check if modal appears
		expect(await findByText("Ban user1?")).toBeTruthy();
	});

	it("bans user when 'Ban User' is pressed", async () => {
		const { findByTestId, findByText } = render(<ParticipantsPage />);

		// Open context menu
		const ellipsisButton = await findByTestId("ellipsis-button-1");
		fireEvent.press(ellipsisButton);

		// Press 'Ban User'
		fireEvent.press(await findByText("Ban User"));

		// Ensure modal closes
		expect(await findByText("Participants")).toBeTruthy();
	});

	it("closes context menu when 'Cancel' is pressed", async () => {
		const { findByTestId, findByText } = render(<ParticipantsPage />);

		// Open context menu
		const ellipsisButton = await findByTestId("ellipsis-button-1");
		fireEvent.press(ellipsisButton);

		// Press 'Cancel'
		fireEvent.press(await findByText("Cancel"));

		// Ensure the modal is closed
		expect(await findByText("Participants")).toBeTruthy();
	});
});
