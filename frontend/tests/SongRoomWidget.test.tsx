import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SongRoomWidget from "../app/components/SongRoomWidget";

describe("SongRoomWidget component", () => {
	const songRoomWidgetProps = {
		songName: "Beautiful Day",
		artist: "U2",
		albumCoverUrl: "https://example.com/album-cover.jpg",
		progress: 0.5,
		time1: "1:30",
		time2: "3:00",
	};

	it("renders correctly with provided props", () => {
		const { getByText, getByTestId } = render(
			<SongRoomWidget {...songRoomWidgetProps} />,
		);

		// Assert song name
		expect(getByText("Beautiful Day")).toBeTruthy();

		// Assert artist name
		expect(getByText("U2")).toBeTruthy();

		// Assert album cover image
		const albumCover = getByTestId("album-cover-image");
		expect(albumCover.props.source.uri).toBe(songRoomWidgetProps.albumCoverUrl);

		// Assert slider value
		const slider = getByTestId("song-slider");
		expect(slider.props.value).toBe(songRoomWidgetProps.progress);

		// Simulate slider value change
		fireEvent(slider, "onValueChange", 0.7); // Example: change slider value to 0.7

		// Add more assertions as needed for time1 and time2
	});

	// Add more specific tests for interactions with the slider and other components if needed
});
