import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import ChatListScreen from "../../app/screens/messaging/ChatListScreen";
import auth from "../../app/services/AuthManagement";
import axios from "axios";
import { DirectMessageDto } from "../../app/models/DmDto";
import { UserDto } from "../../app/models/UserDto";

// Mocking dependencies
jest.mock("axios");
jest.mock("../../app/services/AuthManagement");

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
	// Add a message from Jane Smith
	{
		index: 2,
		messageBody: "Hello!",
		sender: {
			...mockOtherUser,
			username: "jane_smith", // Ensure this matches your expectations
			profile_name: "Jane Smith",
		},
		recipient: mockSelf,
		dateSent: new Date(),
		dateRead: new Date(0),
		isRead: false,
		pID: "2",
	},
];

const mockUserData = {
	userID: "selfID",
	username: "selfUser",
};

beforeEach(() => {
	jest.clearAllMocks();

	// Mocking the token retrieval
	(auth.getToken as jest.Mock).mockResolvedValue("mockedToken");

	// Mocking the axios calls
	(axios.get as jest.Mock).mockImplementation((url) => {
		if (url.includes("/users/dms")) {
			return Promise.resolve({ data: initialMessages });
		} else if (url.includes("/users")) {
			return Promise.resolve({ data: mockUserData });
		} else if (url.includes("/users/friends")) {
			return Promise.resolve({ data: [] }); // No friends for simplicity
		}
		return Promise.reject(new Error("Not found"));
	});
});

// Wrap your ChatListScreen component with NavigationContainer
const renderWithNavigation = (component: React.ReactNode) => (
	<NavigationContainer>{component}</NavigationContainer>
);

describe("ChatListScreen", () => {
	test("renders correctly and fetches chats on focus", async () => {
		const { getByText } = render(renderWithNavigation(<ChatListScreen />));

		// Check if the header is present
		expect(getByText("Chats")).toBeTruthy();

		// Wait for chat items to be rendered
		await waitFor(() => expect(getByText("John Doe")).toBeTruthy());
		expect(getByText("Jane Smith")).toBeTruthy();
	});

	test("filters chats based on search input", async () => {
		const { getByPlaceholderText, getByText } = render(
			renderWithNavigation(<ChatListScreen />),
		);

		// Wait for chat items to be rendered
		await waitFor(() => expect(getByText("John Doe")).toBeTruthy());

		// Input search query
		const searchInput = getByPlaceholderText("Search for a user...");
		fireEvent.changeText(searchInput, "Jane");

		// Check if only relevant chat appears
		await waitFor(() => expect(getByText("Jane Smith")).toBeTruthy());
		expect(() => getByText("John Doe")).toThrow();
	});

	test("shows 'No results found' when no chats match the search", async () => {
		const { getByPlaceholderText, getByText } = render(
			renderWithNavigation(<ChatListScreen />),
		);

		// Wait for chat items to be rendered
		await waitFor(() => expect(getByText("John Doe")).toBeTruthy());

		// Input a search query that matches no results
		const searchInput = getByPlaceholderText("Search for a user...");
		fireEvent.changeText(searchInput, "Nonexistent User");

		// Check for no results message
		expect(getByText("No results found.")).toBeTruthy();
	});
});
