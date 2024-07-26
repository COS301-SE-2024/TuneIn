import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SongList from "../app/components/SongList";
import { StyleSheet } from "react-native"; // Import StyleSheet to access styles
import { Track } from "../app/models/Track";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

jest.mock("@expo/vector-icons", () => ({
	Ionicons: "MockedIonicons",
}));

jest.mock("../app/components/Voting", () => {
	return {
		__esModule: true,
		default: ({ voteCount }: { voteCount: number }) => {
			return <div>Votes: {voteCount}</div>;
		},
	};
});

describe("SongList", () => {
	const mockSwapSongs = jest.fn();

	const track: Track = {
		id: "1",
		name: "Test Song",
		artists: [{ name: "Test Artist" }],
		album: { images: [{ url: "https://example.com/test.jpg" }] },
		explicit: false,
		preview_url: "https://example.com/preview.mp3",
		uri: "spotify:track:1",
		duration_ms: 180000,
		albumArtUrl: "https://example.com/test.jpg",
	};

	it("renders correctly", () => {
		const { getByText, getByTestId } = render(
			<SongList
				track={track}
				voteCount={5}
				showVoting={true}
				songNumber={1}
				index={0}
				isCurrent={false}
				swapSongs={mockSwapSongs}
			/>,
		);

		expect(getByText("1")).toBeTruthy();
		expect(getByTestId("album-cover-image").props.source.uri).toBe(
			"https://example.com/test.jpg",
		);
		expect(getByText("Test Song")).toBeTruthy();
		expect(getByText("Test Artist")).toBeTruthy();
	});

	it("renders current song correctly", () => {
		const { getByText } = render(
			<SongList
				track={track}
				voteCount={5}
				showVoting={true}
				songNumber={1}
				index={0}
				isCurrent={true}
				swapSongs={mockSwapSongs}
			/>,
		);
		expect(getByText("Test Song").props.style[1].color).toBe("blue");
	});

	// it("calls swapSongs function on up vote", () => {
	// 	const { getByText } = render(
	// 		<SongList
	// 			track={track}
	// 			voteCount={5}
	// 			showVoting={true}
	// 			songNumber={1}
	// 			index={0}
	// 			isCurrent={false}
	// 			swapSongs={mockSwapSongs}
	// 		/>,
	// 	);

	// 	fireEvent.press(getByText("Votes: 5"));
	// 	expect(mockSwapSongs).toHaveBeenCalledWith(0, "up");
	// });

	it("handles more button press", () => {
		const { getByTestId } = render(
			<SongList
				track={track}
				voteCount={5}
				showVoting={true}
				songNumber={1}
				index={0}
				isCurrent={false}
				swapSongs={mockSwapSongs}
			/>,
		);

		fireEvent.press(getByTestId("more-button"));
		// Add your expectation for the more button press here
	});
});
