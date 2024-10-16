import React, { useState } from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
import * as StorageService from "../app/services/StorageService";
import { useLocalSearchParams } from "expo-router";
import { Player } from "../app/PlayerContext";
import EditProfileScreen from "../app/screens/profile/EditProfilePage";

jest.mock("react-native-gesture-handler", () => {
	const MockView = (props) => <div {...props} />;
	return {
		GestureHandlerRootView: MockView,
		TouchableOpacity: MockView,
	};
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
}));

// Mock axios GET request
jest.mock("axios");
jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

jest.mock("../app/services/StorageService", () => ({
	__esModule: true,
	getItem: jest.fn(),
}));

jest.mock("expo-router", () => {
	const actualModule = jest.requireActual("expo-router");
	return {
		...actualModule,
		useNavigation: jest.fn(),
		useLocalSearchParams: jest.fn(),
		useRouter: () => ({
			navigate: jest.fn(), // Mock the navigate function
		}),
	};
});

const PlayerContextProviderMock = ({ children, value }) => {
	const [userData, setUserData] = useState(value.userData);

	const mockValue = {
		...value,
		userData,
		setUserData,
	};

	return <Player.Provider value={mockValue}>{children}</Player.Provider>;
};

describe("ProfileScreen", () => {
	beforeEach(() => {
		// Clear mocks and set initial states
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
		(auth.getToken as jest.Mock).mockReturnValue("token");
		(StorageService.getItem as jest.Mock).mockResolvedValue([]);
	});

	it("renders edit page", async () => {
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 0 },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: ["j-pop"] },
			fav_songs: {
				count: 1,
				data: [
					{
						title: "STYX HELIX",
						artists: ["MYTH & ROID"],
						cover:
							"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
						spotify_id: "2tcSz3bcJqriPg9vetvJLs",
						duration: 289,
						start_time: null,
					},
				],
			},
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			profile: JSON.stringify(mockProfileData),
		});
		(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

		const mockPlayerContextValue = {
			userData: {
				profile_name: "John Doe",
				username: "johndoe",
				profile_picture_url:
					"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
				followers: { count: 10 },
				following: { count: 20 },
				bio: "Mock bio",
				links: {
					count: 1,
					data: [{ type: "example", links: "https://example.com" }],
				},
				fav_genres: { count: 1, data: [] },
				fav_songs: {
					count: 1,
					data: [
						{
							title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
							artists: ["Frédéric Chopin", "Arthur Rubinstein"],
							cover: null,
							spotify_id: "5AnNbtnz54r94cd2alxg5I",
							start_time: null,
						},
					],
				},
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			},
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		const { getByDisplayValue, getByText } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<EditProfileScreen />
			</PlayerContextProviderMock>,
		);

		expect(getByDisplayValue("John Doe")).toBeTruthy;
		expect(getByDisplayValue("johndoe")).toBeTruthy;
		expect(getByDisplayValue("Mock bio")).toBeTruthy;
		expect(getByDisplayValue("https://example.com")).toBeTruthy;
		expect(getByText("j-pop")).toBeTruthy;
		expect(getByText("STYX HELIX")).toBeTruthy;
	});

	// it("handles update", async () => {
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 0 },
	// 		following: { count: 0 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: { other: ["https://example.com"] },
	// 		},
	// 		fav_genres: { count: 1, data: ["j-pop"] },
	// 		fav_songs: {
	// 			count: 1,
	// 			data: [
	// 				{
	// 					title: "STYX HELIX",
	// 					artists: ["MYTH & ROID"],
	// 					cover:
	// 						"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
	// 					spotify_id: "2tcSz3bcJqriPg9vetvJLs",
	// 					duration: 289,
	// 					start_time: null,
	// 				},
	// 			],
	// 		},
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		profile: JSON.stringify(mockProfileData),
	// 	});

	// 	const mockPlayerContextValue = {
	// 		userData: {
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			profile_picture_url:
	// 				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com" }],
	// 			},
	// 			fav_genres: { count: 1, data: [] },
	// 			fav_songs: {
	// 				count: 1,
	// 				data: [
	// 					{
	// 						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
	// 						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
	// 						cover: null,
	// 						spotify_id: "5AnNbtnz54r94cd2alxg5I",
	// 						start_time: null,
	// 					},
	// 				],
	// 			},
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		},
	// 		setUserData: jest.fn(),
	// 		currentRoom: "Room 1",
	// 	};

	// 	(axios.patch as jest.Mock).mockImplementation(jest.fn());
	// 	(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

	// 	const { getByTestId, getByDisplayValue } = render(
	// 		<PlayerContextProviderMock value={mockPlayerContextValue}>
	// 			<EditProfileScreen />
	// 		</PlayerContextProviderMock>,
	// 	);
	// 	const name = getByDisplayValue("John Doe");
	// 	const save = getByTestId("save-button");

	// 	fireEvent.changeText(name, "Jane Doe");
	// 	fireEvent.press(save);

	// 	await waitFor(() => {
	// 		expect(getByTestId("loading-indicator")).toBeTruthy();
	// 	});
	// });

	// it("changes TextInput display values when values are changed", async () => {
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 0 },
	// 		following: { count: 0 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: { other: ["https://example.com"] },
	// 		},
	// 		fav_genres: { count: 1, data: ["j-pop"] },
	// 		fav_songs: {
	// 			count: 1,
	// 			data: [
	// 				{
	// 					title: "STYX HELIX",
	// 					artists: ["MYTH & ROID"],
	// 					cover:
	// 						"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
	// 					spotify_id: "2tcSz3bcJqriPg9vetvJLs",
	// 					duration: 289,
	// 					start_time: null,
	// 				},
	// 			],
	// 		},
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		profile: JSON.stringify(mockProfileData),
	// 	});
	// 	(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

	// 	const mockPlayerContextValue = {
	// 		userData: {
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			profile_picture_url:
	// 				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com" }],
	// 			},
	// 			fav_genres: { count: 1, data: [] },
	// 			fav_songs: {
	// 				count: 1,
	// 				data: [
	// 					{
	// 						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
	// 						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
	// 						cover: null,
	// 						spotify_id: "5AnNbtnz54r94cd2alxg5I",
	// 						start_time: null,
	// 					},
	// 				],
	// 			},
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		},
	// 		setUserData: jest.fn(),
	// 		currentRoom: "Room 1",
	// 	};

	// 	const { getByDisplayValue } = render(
	// 		<PlayerContextProviderMock value={mockPlayerContextValue}>
	// 			<EditProfileScreen />
	// 		</PlayerContextProviderMock>,
	// 	);

	// 	const name = getByDisplayValue("John Doe");
	// 	const username = getByDisplayValue("johndoe");
	// 	const bio = getByDisplayValue("Mock bio");
	// 	const link = getByDisplayValue("https://example.com");

	// 	fireEvent.changeText(name, "Jane Doe");
	// 	fireEvent.changeText(username, "janedoe");
	// 	fireEvent.changeText(bio, "New bio");
	// 	fireEvent.changeText(link, "https://newexample.com");

	// 	expect(getByDisplayValue("Jane Doe")).toBeTruthy();
	// 	expect(getByDisplayValue("janedoe")).toBeTruthy();
	// 	expect(getByDisplayValue("New bio")).toBeTruthy();
	// 	expect(getByDisplayValue("https://newexample.com")).toBeTruthy();
	// });

	// it("changes shows error message when username is invalid", async () => {
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 0 },
	// 		following: { count: 0 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: { other: ["https://example.com"] },
	// 		},
	// 		fav_genres: { count: 1, data: ["j-pop"] },
	// 		fav_songs: {
	// 			count: 1,
	// 			data: [
	// 				{
	// 					title: "STYX HELIX",
	// 					artists: ["MYTH & ROID"],
	// 					cover:
	// 						"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
	// 					spotify_id: "2tcSz3bcJqriPg9vetvJLs",
	// 					duration: 289,
	// 					start_time: null,
	// 				},
	// 			],
	// 		},
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		profile: JSON.stringify(mockProfileData),
	// 	});
	// 	(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

	// 	const mockPlayerContextValue = {
	// 		userData: {
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			profile_picture_url:
	// 				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com" }],
	// 			},
	// 			fav_genres: { count: 1, data: [] },
	// 			fav_songs: {
	// 				count: 1,
	// 				data: [
	// 					{
	// 						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
	// 						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
	// 						cover: null,
	// 						spotify_id: "5AnNbtnz54r94cd2alxg5I",
	// 						start_time: null,
	// 					},
	// 				],
	// 			},
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		},
	// 		setUserData: jest.fn(),
	// 		currentRoom: "Room 1",
	// 	};

	// 	const { getByDisplayValue, getByText } = render(
	// 		<PlayerContextProviderMock value={mockPlayerContextValue}>
	// 			<EditProfileScreen />
	// 		</PlayerContextProviderMock>,
	// 	);

	// 	const username = getByDisplayValue("johndoe");

	// 	fireEvent.changeText(username, "Janedoe");

	// 	expect(
	// 		getByText(
	// 			"Usernames must contain only lowercase letters and numbers, with no spaces or special characters",
	// 		),
	// 	).toBeTruthy();
	// });

	// it("deletes items", async () => {
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 0 },
	// 		following: { count: 0 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: { other: ["https://example.com"] },
	// 		},
	// 		fav_genres: { count: 1, data: ["j-pop"] },
	// 		fav_songs: {
	// 			count: 1,
	// 			data: [
	// 				{
	// 					title: "STYX HELIX",
	// 					artists: ["MYTH & ROID"],
	// 					cover:
	// 						"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
	// 					spotify_id: "2tcSz3bcJqriPg9vetvJLs",
	// 					duration: 289,
	// 					start_time: null,
	// 				},
	// 			],
	// 		},
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		profile: JSON.stringify(mockProfileData),
	// 	});
	// 	(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

	// 	const mockPlayerContextValue = {
	// 		userData: {
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			profile_picture_url:
	// 				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com" }],
	// 			},
	// 			fav_genres: { count: 1, data: [] },
	// 			fav_songs: {
	// 				count: 1,
	// 				data: [
	// 					{
	// 						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
	// 						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
	// 						cover: null,
	// 						spotify_id: "5AnNbtnz54r94cd2alxg5I",
	// 						start_time: null,
	// 					},
	// 				],
	// 			},
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		},
	// 		setUserData: jest.fn(),
	// 		currentRoom: "Room 1",
	// 	};

	// 	const { queryByText, getByTestId } = render(
	// 		<PlayerContextProviderMock value={mockPlayerContextValue}>
	// 			<EditProfileScreen />
	// 		</PlayerContextProviderMock>,
	// 	);

	// 	const genre = getByTestId("j-pop-genre-close");
	// 	const song = getByTestId("STYX HELIX-song-close");
	// 	const link = getByTestId("https://example.com-close");

	// 	fireEvent.press(genre);
	// 	fireEvent.press(song);
	// 	fireEvent.press(link);

	// 	expect(queryByText("j-pop")).toBeFalsy;
	// 	expect(queryByText("STYX HELIX")).toBeFalsy();
	// 	expect(queryByText("https://example.com")).toBeFalsy();
	// });

	// it("opens genre selector", async () => {
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 0 },
	// 		following: { count: 0 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: { other: ["https://example.com"] },
	// 		},
	// 		fav_genres: { count: 1, data: ["j-pop"] },
	// 		fav_songs: {
	// 			count: 1,
	// 			data: [
	// 				{
	// 					title: "STYX HELIX",
	// 					artists: ["MYTH & ROID"],
	// 					cover:
	// 						"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
	// 					spotify_id: "2tcSz3bcJqriPg9vetvJLs",
	// 					duration: 289,
	// 					start_time: null,
	// 				},
	// 			],
	// 		},
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		profile: JSON.stringify(mockProfileData),
	// 	});
	// 	(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

	// 	const mockPlayerContextValue = {
	// 		userData: {
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			profile_picture_url:
	// 				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com" }],
	// 			},
	// 			fav_genres: { count: 1, data: [] },
	// 			fav_songs: {
	// 				count: 1,
	// 				data: [
	// 					{
	// 						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
	// 						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
	// 						cover: null,
	// 						spotify_id: "5AnNbtnz54r94cd2alxg5I",
	// 						start_time: null,
	// 					},
	// 				],
	// 			},
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		},
	// 		setUserData: jest.fn(),
	// 		currentRoom: "Room 1",
	// 	};

	// 	const { getByTestId } = render(
	// 		<PlayerContextProviderMock value={mockPlayerContextValue}>
	// 			<EditProfileScreen />
	// 		</PlayerContextProviderMock>,
	// 	);

	// 	const addGenre = getByTestId("add-genre");

	// 	fireEvent.press(addGenre);

	// 	expect(getByTestId("genre-selector").props.visible).toBe(true);
	// });

	// it("opens song selector", async () => {
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 0 },
	// 		following: { count: 0 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: { other: ["https://example.com"] },
	// 		},
	// 		fav_genres: { count: 1, data: ["j-pop"] },
	// 		fav_songs: {
	// 			count: 1,
	// 			data: [
	// 				{
	// 					title: "STYX HELIX",
	// 					artists: ["MYTH & ROID"],
	// 					cover:
	// 						"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
	// 					spotify_id: "2tcSz3bcJqriPg9vetvJLs",
	// 					duration: 289,
	// 					start_time: null,
	// 				},
	// 			],
	// 		},
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		profile: JSON.stringify(mockProfileData),
	// 	});
	// 	(axios.get as jest.Mock).mockResolvedValue({ data: ["genre"] });

	// 	const mockPlayerContextValue = {
	// 		userData: {
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			profile_picture_url:
	// 				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com" }],
	// 			},
	// 			fav_genres: { count: 1, data: [] },
	// 			fav_songs: {
	// 				count: 1,
	// 				data: [
	// 					{
	// 						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
	// 						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
	// 						cover: null,
	// 						spotify_id: "5AnNbtnz54r94cd2alxg5I",
	// 						start_time: null,
	// 					},
	// 				],
	// 			},
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		},
	// 		setUserData: jest.fn(),
	// 		currentRoom: "Room 1",
	// 	};

	// 	const { queryByText: queryByTestId, getByTestId } = render(
	// 		<PlayerContextProviderMock value={mockPlayerContextValue}>
	// 			<EditProfileScreen />
	// 		</PlayerContextProviderMock>,
	// 	);

	// 	const genre = getByTestId("add-song");

	// 	fireEvent.press(genre);

	// 	expect(getByTestId("song-dialog").props.visible).toBe(true);
	// });
});
