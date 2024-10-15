import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ChatItem from "../app/components/ChatItem"; // Adjust the import path as necessary
import { Chat } from "../app/models/chat"; // Adjust the import path as necessary
import { DirectMessageDto, UserDto } from "../api";

const mockSelf: UserDto = {
	userID: "1",
	username: "john_doe",
	profile_name: "John Doe",
	profile_picture_url:
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	followers: {
		count: 0,
		data: [],
	},
	following: {
		count: 0,
		data: [],
	},
	links: {
		count: 0,
		data: [],
	},
	bio: "",
	current_song: {
		title: "Song Name",
		artists: ["Artist Name"],
		cover: "",
		start_time: new Date(),
	},
	fav_genres: {
		count: 0,
		data: [],
	},
	fav_songs: {
		count: 0,
		data: [],
	},
	fav_rooms: {
		count: 0,
		data: [],
	},
	recent_rooms: {
		count: 0,
		data: [],
	},
};

const mockOtherUser: UserDto = {
	profile_name: "Jane Smith",
	userID: "2",
	username: "jane_smith",
	profile_picture_url: "",
	followers: {
		count: 0,
		data: [],
	},
	following: {
		count: 0,
		data: [],
	},
	links: {
		count: 0,
		data: [],
	},
	bio: "",
	current_song: {
		title: "",
		artists: [],
		cover: "",
		start_time: new Date(),
	},
	fav_genres: {
		count: 0,
		data: [],
	},
	fav_songs: {
		count: 0,
		data: [],
	},
	fav_rooms: {
		count: 0,
		data: [],
	},
	recent_rooms: {
		count: 0,
		data: [],
	},
	friendship: undefined,
};

const message: DirectMessageDto = {
	index: 1,
	messageBody: "Hello there!",
	sender: mockSelf,
	recipient: mockOtherUser,
	dateSent: new Date(),
	dateRead: new Date(),
	isRead: true,
	pID: "1",
};

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
		const { getByText } = render(
			<ChatItem message={message} otherUser={mockOtherUser} />,
		);

		expect(getByText(mockOtherUser.profile_name)).toBeTruthy();
		expect(getByText(message.messageBody)).toBeTruthy();
	});

	it("navigates to the correct route when pressed", () => {
		const { getByTestId } = render(
			<ChatItem message={message} otherUser={mockOtherUser} />,
		);
		const touchable = getByTestId("chat-item-touchable");

		fireEvent.press(touchable);

		expect(pushMock).toHaveBeenCalledWith(
			`/screens/messaging/ChatScreen?username=${mockOtherUser.username}`,
		);
	});
});
