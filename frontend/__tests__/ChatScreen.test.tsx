import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ChatScreen from "../app/screens/messaging/ChatScreen";
import { useRouter, useLocalSearchParams } from "expo-router";
// import { TextInput } from "react-native";
import { UserDto } from "../app/models/UserDto";
// import { DirectMessageDto } from "../app/models/DmDto";
import axios from "axios";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

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

// const initialMessages: DirectMessage[] = [
// 	{
// 		message: {
// 			index: 0,
// 			messageBody: "Hey there!",
// 			sender: mockSelf,
// 			recipient: mockOtherUser,
// 			dateSent: new Date(),
// 			dateRead: new Date(0),
// 			isRead: false,
// 			pID: "0",
// 		},
// 		me: true,
// 		messageSent: true,
// 	},
// 	{
// 		message: {
// 			index: 1,
// 			messageBody: "What's up?",
// 			sender: mockOtherUser,
// 			recipient: mockSelf,
// 			dateSent: new Date(),
// 			dateRead: new Date(0),
// 			isRead: false,
// 			pID: "1",
// 		},
// 		me: false,
// 		messageSent: true,
// 	},
// 	// Add more dummy messages
// ];

jest.mock("axios");
(axios.get as jest.Mock).mockImplementation((url: string) => {
	if (url.includes(":3000/users/")) {
		return Promise.resolve({ data: mockOtherUser });
	} else if (url.endsWith(":3000/users")) {
		return Promise.resolve({ data: mockSelf });
	} else if (url.endsWith(":3000/auth/spotify/tokens")) {
		return Promise.resolve({
			data: {
				access_token: "mock-access-token",
				token_type: "Bearer",
				scope: "user-read-private user-read-email",
				expires_in: 3600,
				refresh_token: "mock-refresh-token",
			},
		});
	}
	return Promise.reject(new Error("Invalid URL"));
});

global.fetch = jest.fn(() => Promise.resolve(new Response()));
jest.mock("@spotify/web-api-ts-sdk", () => ({
	SpotifyApi: {
		withAccessToken: jest.fn().mockImplementation(() => ({
			currentUser: {
				profile: jest.fn(),
			},
			player: {
				getAvailableDevices: jest.fn(),
				getPlaybackState: jest.fn(),
			},
		})),
	},
}));

describe("ChatScreen", () => {
	// const mockSetState = jest.fn();
	const mockRouter = {
		back: jest.fn(),
	};

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();

		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: "jane_smith",
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders the chat screen correctly", () => {
		const { toJSON } = render(<ChatScreen />);
		expect(toJSON()).toMatchSnapshot();
	});

	/*
	it("sends a message correctly", () => {
		const { getByTestId, getByText } = render(<ChatScreen />);
		const messageInput = getByTestId("messageInput");

		// Assuming the send button has a specific testID
		const sendButton = getByTestId("sendButton");
		fireEvent.changeText(messageInput, "Hello");
		//expect(messageInput.props.value).toBe("Hello");
		fireEvent.press(sendButton);

		expect(messageInput.props.value).toBe("");
		const messageText = getByText("Hello");
		expect(messageText).toBeTruthy();
	});
	*/

	it("navigates back when back button is pressed", () => {
		const { getByTestId } = render(<ChatScreen />);

		// Assuming the back button has a specific testID
		const backButton = getByTestId("backButton");

		fireEvent.press(backButton);

		expect(mockRouter.back).toHaveBeenCalled();
	});
});
