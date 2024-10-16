import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useLive } from "../app/LiveContext";
import ChatItem from "../app/components/ChatItem"; // Adjust the path as needed

// Mock external dependencies
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

describe("ChatItem", () => {
	let mockRouter;

	beforeEach(() => {
		// Setup mock for router
		mockRouter = { push: jest.fn() };
		(useRouter as jest.Mock).mockReturnValue(mockRouter);

		// Mock useLive functions
		(useLive as jest.Mock).mockReturnValue({
			enterDM: jest.fn(),
			leaveDM: jest.fn(),
			socketHandshakes: { dmJoined: false }, // Initially not joined
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly", () => {
		const message = { messageBody: "Hello", bodyIsRoomID: false };
		const otherUser = {
			username: "testUser",
			profile_name: "Test User",
			profile_picture_url: "https://example.com/avatar.png",
		};

		const { getByText, getByTestId } = render(
			<ChatItem message={message} otherUser={otherUser} />,
		);

		// Check if the user's name and message are displayed
		expect(getByText("Test User")).toBeTruthy();
		expect(getByText("Hello")).toBeTruthy();

		// Check if the avatar is rendered
		expect(getByTestId("chat-item-avatar")).toBeTruthy();
	});

	it("navigates to ChatScreen and handles enterDM when pressed", () => {
		const message = { messageBody: "Hello", bodyIsRoomID: false };
		const otherUser = {
			username: "testUser",
			profile_name: "Test User",
			profile_picture_url: "https://example.com/avatar.png",
		};

		const { getByTestId } = render(
			<ChatItem message={message} otherUser={otherUser} />,
		);

		const chatItem = getByTestId("chat-item-touchable");
		fireEvent.press(chatItem);

		// Check if enterDM is called
		expect(useLive().enterDM).toHaveBeenCalledWith(["testUser"]);

		// Check if the router navigates to the ChatScreen
		expect(mockRouter.push).toHaveBeenCalledWith(
			"/screens/messaging/ChatScreen?username=testUser",
		);
	});

	it("calls leaveDM if already in a DM", () => {
		(useLive as jest.Mock).mockReturnValue({
			enterDM: jest.fn(),
			leaveDM: jest.fn(),
			socketHandshakes: { dmJoined: true }, // Simulating that DM is already joined
		});

		const message = { messageBody: "Hello", bodyIsRoomID: false };
		const otherUser = {
			username: "testUser",
			profile_name: "Test User",
			profile_picture_url: "https://example.com/avatar.png",
		};

		const { getByTestId } = render(
			<ChatItem message={message} otherUser={otherUser} />,
		);

		const chatItem = getByTestId("chat-item-touchable");
		fireEvent.press(chatItem);

		// Check if leaveDM is called since DM was already joined
		expect(useLive().leaveDM).toHaveBeenCalled();
	});
});
