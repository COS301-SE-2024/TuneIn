import React from "react";
import { render } from "@testing-library/react-native";
import RoomCard from "../../app/components/rooms/RoomCard"; // Update this path accordingly

describe("RoomCard Component", () => {
	const defaultProps = {
		roomName: "Lounge",
		imageUrl: "https://example.com/image.jpg",
	};

	it("renders correctly with minimal props", () => {
		const { getByText, getByTestId } = render(<RoomCard {...defaultProps} />);

		expect(getByText("Lounge")).toBeTruthy();
		expect(getByTestId("imageBackground"));
	});

	it("renders song information correctly when songName and artistName are provided", () => {
		const props = {
			...defaultProps,
			songName: "Song Title",
			artistName: "Artist Name",
		};
		const { getByText } = render(<RoomCard {...props} />);

		expect(getByText("Now playing: Song Title by Artist Name")).toBeTruthy();
	});

	it("truncates text if it exceeds max length", () => {
		const props = {
			...defaultProps,
			roomName: "A very long room name",
			songName: "song name that should be truncated",
			artistName: "artist name",
		};
		const { getByText } = render(<RoomCard {...props} />);

		// Check for truncated room name
		expect(getByText("A very long room ...")).toBeTruthy();

		// Check for truncated song name
		expect(getByText("song name that sh...")).toBeTruthy();

		// Check for artist name
		expect(getByText("artist name")).toBeTruthy();
	});
});
