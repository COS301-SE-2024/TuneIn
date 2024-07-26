import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SongRoomWidget from "../app/components/SongRoomWidget";
import { Track } from "../app/models/Track";

const mockTrack: Track = {
	id: "1",
	name: "Mock Song",
	artists: [{ name: "Mock Artist" }],
	album: {
		images: [{ url: "https://example.com/mock-album-cover.jpg" }],
	},
	explicit: false,
	preview_url: "https://example.com/mock-preview.mp3",
	uri: "spotify:track:1",
	duration_ms: 210000,
};

describe("SongRoomWidget", () => {
	it("renders the song room widget correctly", () => {
		const { getByText, getByTestId } = render(
			<SongRoomWidget
				track={mockTrack}
				progress={0.5}
				time1="0:00"
				time2="3:30"
			/>,
		);

		// Check song name
		expect(getByText("Mock Song")).toBeTruthy();

		// Check artist name
		expect(getByText("Mock Artist")).toBeTruthy();

		// Check album cover image source
		const albumCoverImage = getByTestId("album-cover-image");
		expect(albumCoverImage.props.source.uri).toBe(
			"https://example.com/mock-album-cover.jpg",
		);

		// Check slider value
		const slider = getByTestId("song-slider");
		expect(slider.props.value).toBe(0.5);

		// Check displayed times
		expect(getByText("0:00")).toBeTruthy();
		expect(getByText("3:30")).toBeTruthy();
	});
});
