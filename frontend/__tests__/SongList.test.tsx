import React from "react";
import { render } from "@testing-library/react-native";
import SongList from "../app/components/SongList";
import { Track } from "../app/models/Track"; // Adjust the import path as needed
const mockTrack: Track = {
	id: "1",
	name: "Test Song",
	artists: [{ name: "Test Artist" }],
	album: {
		images: [{ url: "https://example.com/test.jpg" }],
	},
	explicit: false,
	preview_url: "https://example.com/preview.mp3",
	uri: "spotify:track:1",
	duration_ms: 200000,
};

describe("SongList Component", () => {
	it("should render correctly", () => {
		const mockSetVoteCount = jest.fn();
		const mockSwapSongs = jest.fn();

		const { getByTestId, getByText } = render(
			<SongList
				track={mockTrack}
				voteCount={10}
				songNumber={1}
				index={0}
				isCurrent={false}
				swapSongs={mockSwapSongs}
				setVoteCount={mockSetVoteCount}
			/>,
		);

		// Check if the album cover image is rendered with the correct URL
		const albumCoverImage = getByTestId("album-cover-image");
		expect(albumCoverImage.props.source.uri).toBe(
			mockTrack.album.images[0].url,
		);

		// Check if the song number is rendered
		const songNumber = getByText("1");
		expect(songNumber).toBeTruthy();

		// Check if the song name is rendered
		const songName = getByText("Test Song");
		expect(songName).toBeTruthy();

		// Check if the artist name is rendered
		const artistName = getByText("Test Artist");
		expect(artistName).toBeTruthy();
	});

	it("should apply current song styles correctly", () => {
		const mockSetVoteCount = jest.fn();
		const mockSwapSongs = jest.fn();

		const { getByTestId, getByText } = render(
			<SongList
				track={mockTrack}
				voteCount={10}
				songNumber={1}
				index={0}
				isCurrent={true}
				swapSongs={mockSwapSongs}
				setVoteCount={mockSetVoteCount}
			/>,
		);

		// Check if the song container has the current song style
		const songContainer = getByTestId("song-container");
		expect(songContainer.props.style).toContainEqual(
			expect.objectContaining({ backgroundColor: "#f0f0f0" }),
		);

		// Check if the song name has the current song text style
		const songName = getByText("Test Song");
		expect(songName.props.style).toContainEqual(
			expect.objectContaining({ color: "blue" }),
		);
	});
});
