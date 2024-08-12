import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ChatItem from "../app/components/ChatItem"; // Adjust the import path as necessary
import { Chat } from "../app/models/chat"; // Adjust the import path as necessary

// Mock the useRouter hook from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("ChatItem", () => {
	const pushMock = jest.fn();

	beforeEach(() => {
		// Reset the mock before each test
		(pushMock as jest.Mock).mockClear();
		(useRouter as jest.Mock).mockReturnValue({
			push: pushMock,
		});
	});

	it("renders correctly with chat prop", () => {
		const chat: Chat = {
			id: "test Chat",
			name: "Test Chat",
			avatar: "https://example.com/avatar.png",
			lastMessage: "Hello there!",
		};

		const { getByText, getByTestId } = render(<ChatItem chat={chat} />);

		expect(getByText(chat.name)).toBeTruthy();
		expect(getByText(chat.lastMessage)).toBeTruthy();
		expect(getByTestId("chat-item-avatar").props.source.uri).toBe(chat.avatar);
	});

	it("navigates to the correct route when pressed", () => {
		const chat: Chat = {
			id: "test Chat",
			name: "Test Chat",
			avatar: "https://example.com/avatar.png",
			lastMessage: "Hello there!",
		};

		const { getByTestId } = render(<ChatItem chat={chat} />);
		const touchable = getByTestId("chat-item-touchable");

		fireEvent.press(touchable);

		expect(pushMock).toHaveBeenCalledWith(
			`/screens/messaging/ChatScreen?name=${chat.name}&avatar=${chat.avatar}`,
		);
	});
});
