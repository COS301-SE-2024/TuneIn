import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ChatListScreen from "../app/screens/messaging/ChatListScreen";
import { useRouter } from "expo-router";

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
	profile_name: "",
	userID: "",
	username: "",
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

const initialMessages: DirectMessageDto[] = [
	{
		index: 0,
		messageBody: "Hey there!",
		sender: mockSelf,
		recipient: mockOtherUser,
		dateSent: new Date(),
		dateRead: new Date(0),
		isRead: false,
		pID: "0",
	},
	{
		index: 1,
		messageBody: "What's up?",
		sender: mockOtherUser,
		recipient: mockSelf,
		dateSent: new Date(),
		dateRead: new Date(0),
		isRead: false,
		pID: "1",
	},
	// Add more dummy messages
];

jest.mock("axios");
(axios.get as jest.Mock).mockImplementation((url: string) => {
	if (url.endsWith("users/dms")) {
		return Promise.resolve({ data: initialMessages });
	} else if (url.endsWith("users/friends")) {
		return Promise.resolve({ data: [mockOtherUser] });
	} else if (url.endsWith("users")) {
		return Promise.resolve({ data: mockSelf });
	}
	return Promise.reject(new Error("Invalid URL"));
});

describe("ChatListScreen", () => {
	const mockRouter = {
		push: jest.fn(),
		back: jest.fn(),
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	/*
	it("renders the chat list screen correctly", () => {
		const { toJSON } = render(<ChatListScreen />);
		expect(toJSON()).toMatchSnapshot();
	});

	it("handles search input correctly", () => {
		const { getByPlaceholderText } = render(<ChatListScreen />);
		const searchInput = getByPlaceholderText("Search for a user..."); // Adjust placeholder to match your component

		fireEvent.changeText(searchInput, "John");

		expect(searchInput.props.value).toBe("John");
	});

	it("navigates back when back button is pressed", () => {
		const { getAllByTestId } = render(<ChatListScreen />);
		const backButton = getAllByTestId("back-button")[0]; // Assuming the back button has a testID of 'back-button'

		fireEvent.press(backButton);

		expect(mockRouter.back).toHaveBeenCalled();
	});
	*/
});
