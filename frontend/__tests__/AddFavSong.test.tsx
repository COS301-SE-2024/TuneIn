import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AddFavSong from "../app/components/AddFavSong"; // Update the path accordingly
import { useSpotifySearch } from "../app/hooks/useSpotifySearch";

jest.mock("../app/hooks/useSpotifySearch");

describe("AddFavSong Component", () => {
	const defaultProps = {
		visible: true,
		handleSave: jest.fn(),
	};

	beforeEach(() => {
		// Mock search results returned by the useSpotifySearch hook
		(useSpotifySearch as jest.Mock).mockReturnValue({
			searchResults: [],
			handleSearch: jest.fn(),
		});
	});

	it("renders correctly when visible", () => {
		const { getByTestId } = render(<AddFavSong {...defaultProps} />);

		// Check that the modal is visible
		expect(getByTestId("song-dialog")).toBeTruthy();
	});

	it("displays search input and allows typing", () => {
		const { getByPlaceholderText } = render(<AddFavSong {...defaultProps} />);

		const searchInput = getByPlaceholderText("Search for songs...");

		fireEvent.changeText(searchInput, "test query");

		expect(searchInput.props.value).toBe("test query");
	});

	// it("calls handleSearch when search button is pressed", async () => {
	// 	const { getByText } = render(<AddFavSong {...defaultProps} />);

	// 	const searchButton = getByText("Search");

	// 	// Simulate search button press
	// 	fireEvent.press(searchButton);

	// 	// Check if handleSearch was called
	// 	await waitFor(() => {
	// 		const { handleSearch } = useSpotifySearch();
	// 		expect(handleSearch).toHaveBeenCalledWith("test query");
	// 	});
	// });

	// it("adds a song to the playlist when the add button is pressed", () => {
	// 	const { getByText } = render(<AddFavSong {...defaultProps} />);

	// 	// Simulate adding a song (mock song data)
	// 	const song = {
	// 		id: "1",
	// 		name: "Test Song",
	// 		artists: [{ name: "Artist Name" }],
	// 		album: { images: [{ url: "https://example.com/album.jpg" }] },
	// 		explicit: false,
	// 		preview_url: "https://example.com/preview.mp3",
	// 		uri: "spotify:track:1",
	// 		duration_ms: 180000,
	// 	};

	// 	// Simulate pressing the add button on the song card
	// 	fireEvent.press(getByText("onAdd"));

	// 	// Check if the song is added to the playlist
	// 	expect(getByText("Test Song")).toBeTruthy();
	// 	expect(getByText("Artist Name")).toBeTruthy();
	// });

	// it("removes a song from the playlist when the remove button is pressed", () => {
	// 	const { getByText } = render(<AddFavSong {...defaultProps} />);

	// 	// Simulate adding and removing a song
	// 	fireEvent.press(getByText("onAdd")); // Adding the song
	// 	fireEvent.press(getByText("Remove")); // Removing the song

	// 	// Check if the song was removed from the playlist
	// 	expect(getByText("Test Song")).toBeFalsy();
	// });

	// it("calls handleSave when the save button is pressed", () => {
	// 	const { getByText } = render(<AddFavSong {...defaultProps} />);

	// 	const saveButton = getByText("Add Songs");

	// 	// Simulate pressing the save button
	// 	fireEvent.press(saveButton);

	// 	// Check if handleSave was called
	// 	expect(defaultProps.handleSave).toHaveBeenCalled();
	// });
});
