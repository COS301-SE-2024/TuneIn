import React from "react";
import { render } from "@testing-library/react-native";
import SongRoomWidget from "../app/components/SongRoomWidget";
import { Track } from "../app/models/Track";

// Mock data
const mockTrack: Track = {
	name: "Song Title",
	artists: [{ name: "Artist 1" }, { name: "Artist 2" }],
	album: {
		images: [{ url: "https://example.com/album-cover.jpg" }],
	},
	id: "",
	explicit: false,
	preview_url: "",
	uri: "",
	duration_ms: 0,
};

// Tests
describe("SongRoomWidget", () => {
	it("renders correctly with the given track data", () => {
		const { getByTestId, getByText } = render(
			<SongRoomWidget track={mockTrack} />,
		);

		// Check if album cover image is rendered
		expect(getByTestId("album-cover-image")).toBeTruthy();

		// Check if song name is rendered
		expect(getByText("Song Title")).toBeTruthy();

		// Check if artist names are rendered
		expect(getByText("Artist 1, Artist 2")).toBeTruthy();
	});

	it("renders the correct album cover image", () => {
		const { getByTestId } = render(<SongRoomWidget track={mockTrack} />);
		const image = getByTestId("album-cover-image");

		expect(image.props.source.uri).toBe("https://example.com/album-cover.jpg");
	});

	it("renders the correct artist names", () => {
		const { getByText } = render(<SongRoomWidget track={mockTrack} />);
		expect(getByText("Artist 1, Artist 2")).toBeTruthy();
	});
});
