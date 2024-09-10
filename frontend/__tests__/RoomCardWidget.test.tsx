import React from "react";
import { render } from "@testing-library/react-native";
import RoomCardWidget from "../app/components/rooms/RoomCardWidget";
import { Room } from "../app/models/Room";

describe("RoomCardWidget component", () => {
	it("renders correctly with provided props", () => {
		const roomCard: Room = {
			userID: "TestUser",
			name: "Living Room",
			description: "A cozy place to relax",
			backgroundImage: "https://example.com/background-image.jpg",
			songName: "Beautiful Day",
			artistName: "U2",
			username: "user123",
			userProfile: "https://example.com/user-profile.jpg",
			mine: false,
			tags: ["tag1", "tag2"],
		};

		const { getByText, queryByTestId, getAllByText } = render(
			<RoomCardWidget roomCard={roomCard} />,
		);

		// Assert room name
		expect(getByText("Living Room")).toBeTruthy();

		// Assert song name and artist name using more specific queries
		expect(getAllByText("Beautiful Day")).toBeTruthy();
		expect(getAllByText("U2")).toBeTruthy();

		// Assert description
		expect(getByText("A cozy place to relax")).toBeTruthy();

		// Assert username
		expect(getByText("user123")).toBeTruthy();

		// Assert tags
		expect(getByText("tag1 • tag2")).toBeTruthy();

		// Assert background image source
		const imageBackground = queryByTestId("room-card-background");
		expect(imageBackground?.props.source.uri).toBe(roomCard.backgroundImage);
	});

	it("renders correctly when 'mine' is true", () => {
		const roomCard: Room = {
			userID: "TestUser",
			name: "My Room",
			description: "Personal room description",
			backgroundImage: "https://example.com/my-room-background.jpg",
			songName: null,
			artistName: null,
			username: "myusername",
			userProfile: "https://example.com/my-profile.jpg",
			mine: true,
			tags: ["personal", "private"],
		};
		const { getByText, queryByTestId } = render(
			<RoomCardWidget roomCard={roomCard} />,
		);
		// Assert room name
		expect(getByText("My Room")).toBeTruthy();
		// Assert description
		expect(getByText("Personal room description")).toBeTruthy();
		// Assert username
		expect(getByText("✎")).toBeTruthy();
		// Assert tags
		expect(getByText("personal • private")).toBeTruthy();
		// Assert background image source
		const imageBackground = queryByTestId("room-card-background");
		expect(imageBackground?.props.source.uri).toBe(roomCard.backgroundImage);
	});

	it("renders correctly when songName and artistName are null", () => {
		const roomCard: Room = {
			userID: "TestUser",
			name: "No Music Room",
			description: "Room without music information",
			backgroundImage: "https://example.com/no-music-background.jpg",
			songName: null,
			artistName: null,
			username: "user321",
			userProfile: "https://example.com/user321-profile.jpg",
			mine: false,
			tags: ["music-free", "quiet"],
		};

		const { getByText, queryByTestId } = render(
			<RoomCardWidget roomCard={roomCard} />,
		);

		// Assert room name
		expect(getByText("No Music Room")).toBeTruthy();

		// Assert description
		expect(getByText("Room without music information")).toBeTruthy();

		// Assert username
		expect(getByText("user321")).toBeTruthy();

		// Assert tags
		expect(getByText("music-free • quiet")).toBeTruthy();

		// Assert background image source
		const imageBackground = queryByTestId("room-card-background");
		expect(imageBackground.props.source.uri).toBe(roomCard.backgroundImage);
	});
});
