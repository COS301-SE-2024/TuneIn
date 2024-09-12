import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Playlist from "../app/screens/rooms/Playlist";
import { Track } from "../app/models/Track";
import SongList from "../app/components/SongList";
import CreateButton from "../app/components/CreateButton";

// Mock the useRouter and useLocalSearchParams hooks
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock components
jest.mock("../app/components/SongList", () => "SongList");
jest.mock("../app/components/CreateButton", () => "CreateButton");

describe("Playlist", () => {
	const navigate = jest.fn();
	const goBack = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ navigate, back: goBack });
	});

	// it("should render correctly with a non-empty playlist", () => {
	// 	const mockPlaylist: Track[] = [
	// 		{
	// 			id: "1",
	// 			name: "Song 1",
	// 			artists: [{ name: "Artist 1" }],
	// 			album: { images: [{ url: "http://example.com/image1.jpg" }] },
	// 			explicit: false,
	// 			preview_url: "http://example.com/preview1.mp3",
	// 			uri: "http://example.com/song1.mp3",
	// 			duration_ms: 180000,
	// 		},
	// 		{
	// 			id: "2",
	// 			name: "Song 2",
	// 			artists: [{ name: "Artist 2" }],
	// 			album: { images: [{ url: "http://example.com/image2.jpg" }] },
	// 			explicit: true,
	// 			preview_url: "http://example.com/preview2.mp3",
	// 			uri: "http://example.com/song2.mp3",
	// 			duration_ms: 200000,
	// 			albumArtUrl: "http://example.com/album2.jpg",
	// 		},
	// 	];

	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		queue: JSON.stringify(mockPlaylist),
	// 		currentTrackIndex: "0",
	// 		Room_id: "room1",
	// 		mine: "true",
	// 	});

	// 	const { getByText, queryByText } = render(<Playlist />);

	// 	// expect(getByText("Manage queue")).toBeTruthy();
	// 	const { getByText } = render(
	// 		<CreateButton title="Manage queue" onPress={() => {}} />,
	// 	);

	// 	// Check if the title is rendered correctly
	// 	expect(getByText("Manage queue")).toBeTruthy();
	// 	expect(queryByText("The queue is empty.")).toBeNull();
	// });

	it("should render correctly with an empty playlist", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			queue: JSON.stringify([]),
			currentTrackIndex: "0",
			Room_id: "room1",
			mine: "true",
		});

		const { getByText } = render(<Playlist />);

		expect(
			getByText("The queue is empty. Add some songs to get started!"),
		).toBeTruthy();
	});

	// it("should navigate to EditPlaylist on button press", () => {
	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		queue: JSON.stringify([]),
	// 		currentTrackIndex: "0",
	// 		Room_id: "room1",
	// 		mine: "true",
	// 	});

	// 	const { getByText } = render(<Playlist />);
	// 	const button = getByText("Manage queue");

	// 	fireEvent.press(button);

	// 	expect(navigate).toHaveBeenCalledWith({
	// 		pathname: "/screens/rooms/EditPlaylist",
	// 		params: {
	// 			queue: JSON.stringify([]),
	// 			currentTrackIndex: "0",
	// 			Room_id: "room1",
	// 			isMine: "true",
	// 		},
	// 	});
	// });

	it("should call router.back when back button is pressed", () => {
		const { getByTestId } = render(<Playlist />);
		const backButton = getByTestId("back-button"); // Add testID to the back button

		fireEvent.press(backButton);

		expect(goBack).toHaveBeenCalled();
	});
});
