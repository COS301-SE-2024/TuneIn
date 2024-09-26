import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import EditPlaylist from "../../app/screens/rooms/EditPlaylist";
import { useSpotifySearch } from "../../app/hooks/useSpotifySearch";
import { useLocalSearchParams, useRouter } from "expo-router";

// Mock hooks and functions
jest.mock("../../app/hooks/useSpotifySearch", () => ({
	useSpotifySearch: jest.fn(),
}));

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

const mockUseSpotifySearch = useSpotifySearch as jest.MockedFunction<
	typeof useSpotifySearch
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
	typeof useLocalSearchParams
>;

describe("EditPlaylist", () => {
	beforeEach(() => {
		mockUseSpotifySearch.mockReturnValue({
			searchResults: [
				{
					id: "1",
					name: "Song 1",
					artists: [{ name: "Artist 1" }],
					album: { images: [{ url: "http://example.com/album1.jpg" }] },
					explicit: false,
					preview_url: "http://example.com/preview1.mp3",
					uri: "spotify:track:1",
					duration_ms: 200000,
				},
			],
			handleSearch: jest.fn(),
			error: null,
		});

		mockUseLocalSearchParams.mockReturnValue({
			Room_id: "room1",
			queue: "[]",
			isMine: "true",
		});
	});

	it("should render all essential elements", () => {
		render(<EditPlaylist />);

		// Check if search input is rendered
		expect(screen.getByPlaceholderText("Search for songs...")).toBeTruthy();

		// Check if search button is rendered
		expect(screen.getByText("Search")).toBeTruthy();

		// Check if save playlist button is rendered
		expect(screen.getByText("Save Playlist")).toBeTruthy();

		// Check if back button is rendered
		expect(screen.getByTestId("back")).toBeTruthy();

		// Check if selected tracks section is rendered
		expect(screen.getByText("Selected Tracks")).toBeTruthy();

		// Check if search results section is rendered
		expect(screen.getByText("Song 1")).toBeTruthy();
	});

	it("should handle search input change", () => {
		render(<EditPlaylist />);

		// Simulate input change
		fireEvent.changeText(
			screen.getByPlaceholderText("Search for songs..."),
			"New Query",
		);

		// Verify the input value
		expect(screen.getByPlaceholderText("Search for songs...").props.value).toBe(
			"New Query",
		);
	});

	it("should handle button clicks", () => {
		render(<EditPlaylist />);

		// Check if the search button click triggers search
		fireEvent.press(screen.getByText("Search"));
		expect(mockUseSpotifySearch().handleSearch).toHaveBeenCalledWith("");
	});

	// Add more tests as needed for other functionalities
});
