import React from "react";
import { render } from "@testing-library/react-native";
import RoomCard from "../app/components/RoomCard";

describe("RoomCard component", () => {
	it("renders correctly with provided props", () => {
		const roomName = "Living Room";
		const songName = "Beautiful Day";
		const artistName = "U2";
		const username = "user123";
		const imageUrl = "https://example.com/room-image.jpg";

		const { getByText, queryByTestId } = render(
			<RoomCard
				roomName={roomName}
				songName={songName}
				artistName={artistName}
				username={username}
				imageUrl={imageUrl}
			/>,
		);

		// Assert room name
		expect(getByText(roomName)).toBeTruthy();

		// Assert song name
		expect(getByText(songName)).toBeTruthy();

		// Assert artist name
		expect(getByText(artistName)).toBeTruthy();

		// Assert username
		expect(getByText(username)).toBeTruthy();

		// Assert background image source
		const imageBackground = queryByTestId("room-card-image-background");
		expect(imageBackground.props.source.uri).toBe(imageUrl);
	});
});
