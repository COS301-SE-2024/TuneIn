// PlayerContextProvider.test.tsx

import React from "react";
import { render, screen } from "@testing-library/react-native";
import { PlayerContextProvider, Player } from "../app/PlayerContext";
import { Text } from "react-native";

// Helper component to consume the context values
const TestComponent: React.FC = () => {
	const context = React.useContext(Player);

	if (!context) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	return (
		<>
			<Text testID="currentTrack">
				{context.currentTrack ? context.currentTrack.name : "No Track"}
			</Text>
			<Text testID="currentTrackIndex">
				{context.currentTrackIndex !== null
					? context.currentTrackIndex.toString()
					: "No Index"}
			</Text>
			<Text testID="numberOfPeople">
				{context.NumberOfPeople !== null
					? context.NumberOfPeople.toString()
					: "No People"}
			</Text>
			<Text testID="currentRoom">
				{context.currentRoom ? context.currentRoom.name : "No Room"}
			</Text>
			<Text testID="trackName">{context.trackName || "No Track Name"}</Text>
			<Text testID="artistName">{context.artistName || "No Artist Name"}</Text>
			<Text testID="albumArt">{context.albumArt || "No Album Art"}</Text>
		</>
	);
};

describe("PlayerContextProvider", () => {
	it("provides the default values", () => {
		render(
			<PlayerContextProvider>
				<TestComponent />
			</PlayerContextProvider>,
		);

		expect(screen.getByTestId("currentTrack").children.join("")).toBe(
			"No Track",
		);
		expect(screen.getByTestId("currentTrackIndex").children.join("")).toBe(
			"No Index",
		);
		expect(screen.getByTestId("numberOfPeople").children.join("")).toBe(
			"No People",
		);
		expect(screen.getByTestId("currentRoom").children.join("")).toBe("No Room");
		expect(screen.getByTestId("trackName").children.join("")).toBe(
			"No Track Name",
		);
		expect(screen.getByTestId("artistName").children.join("")).toBe(
			"No Artist Name",
		);
		expect(screen.getByTestId("albumArt").children.join("")).toBe(
			"No Album Art",
		);
	});
});
