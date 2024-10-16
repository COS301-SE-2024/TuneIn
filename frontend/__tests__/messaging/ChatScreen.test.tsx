import React from "react";
import ChatScreen from "../../app/screens/messaging/ChatScreen";
import { useRouter, useLocalSearchParams } from "expo-router";
import { UserDto, DirectMessageDto } from "../../api";
import axios from "axios";
import { render, fireEvent, screen, act } from "@testing-library/react-native";
import { useLive } from "../../app/LiveContext";
import { DirectMessage } from "../../app/hooks/useDMControls";

// Mock `useLive` hook
jest.mock("../../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

// Mock `useRouter` and `useLocalSearchParams` hooks
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

describe("ChatScreen", () => {
	const mockRouter = {
		back: jest.fn(),
	};

	const mockDmControls = {
		sendDirectMessage: jest.fn(),
		requestDirectMessageHistory: jest.fn(),
	};

	const mockDirectMessages: DirectMessage[] = [
		{
			message: {
				index: 0,
				messageBody: "Test Message",
				sender: { userID: "user1", username: "User 1" },
				recipient: { userID: "user2", username: "User 2" },
				dateSent: new Date().toISOString(),
				dateRead: new Date(0).toISOString(),
				isRead: false,
				pID: "",
				bodyIsRoomID: false,
			},
			me: true,
			messageSent: true,
			isOptimistic: false,
		},
	];

	const mockUser = {
		userID: "user1",
		username: "User 1",
	};

	const mockDmParticipants = [
		{
			userID: "user2",
			username: "User 2",
			profile_name: "User Two",
			profile_picture_url: "https://example.com/profile.jpg",
		},
	];

	const mockSocketHandshakes = {
		dmJoined: true,
		dmsReceived: true,
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		(useLocalSearchParams as jest.Mock).mockReturnValue({ username: "User 2" }); // Mock the return value
		(useLive as jest.Mock).mockReturnValue({
			currentUser: mockUser,
			enterDM: jest.fn(),
			leaveDM: jest.fn(),
			dmControls: mockDmControls,
			dmParticipants: mockDmParticipants,
			directMessages: mockDirectMessages,
			socketHandshakes: mockSocketHandshakes,
		});
	});

	it("renders the chat screen with messages and header", async () => {
		render(<ChatScreen />);

		// Check if the back button is present
		const backButton = screen.getByTestId("backButton");
		expect(backButton).toBeTruthy();

		// Check if the participant's name is displayed
		expect(screen.getByText("User Two")).toBeTruthy();

		// Check if the message is displayed
		expect(screen.getByText("Test Message")).toBeTruthy();
	});

	it("handles back button press", async () => {
		render(<ChatScreen />);

		const backButton = screen.getByTestId("backButton");

		await act(async () => {
			fireEvent.press(backButton);
		});

		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("sends a message when the send button is pressed", async () => {
		render(<ChatScreen />);

		// Enter text into the input
		const messageInput = screen.getByTestId("messageInput");
		await act(async () => {
			fireEvent.changeText(messageInput, "Hello");
		});

		expect(messageInput.props.value).toBe("Hello");

		// Press the send button
		const sendButton = screen.getByTestId("sendButton");
		await act(async () => {
			fireEvent.press(sendButton);
		});

		// Check if sendDirectMessage was called
		expect(mockDmControls.sendDirectMessage).toHaveBeenCalled();
	});
});
