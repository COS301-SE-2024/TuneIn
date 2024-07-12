import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SongList, { SongListProps } from "../app/components/SongList";
import { StyleSheet } from "react-native"; // Import StyleSheet to access styles

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

// Mock or import styles from SongList.tsx
const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
		marginVertical: 8,
	},
	currentSong: {
		backgroundColor: "#f0f0f0", // Highlight color for current song
	},
	songNumber: {
		fontSize: 16,
		fontWeight: "bold",
		marginRight: 16,
	},
	albumCover: {
		width: 60,
		height: 60,
		borderRadius: 4,
		marginRight: 16,
	},
	infoContainer: {
		flex: 1,
		justifyContent: "center",
	},
	songName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	currentSongText: {
		color: "blue", // Text color for current song
	},
	artist: {
		fontSize: 14,
		color: "#666",
	},
	moreButton: {
		marginLeft: 16,
	},
});

describe("SongList component", () => {
	const mockSwapSongs = jest.fn();

	const songListProps: SongListProps = {
		songName: "Beautiful Day",
		artist: "U2",
		albumCoverUrl: "https://example.com/album-cover.jpg",
		voteCount: 10,
		showVoting: true,
		songNumber: 1,
		index: 0,
		isCurrent: true,
		swapSongs: mockSwapSongs,
	};

	it("renders correctly with provided props", () => {
		const { getByText, getByTestId } = render(<SongList {...songListProps} />);

		// Assert song name
		expect(getByText("Beautiful Day")).toBeTruthy();

		// Assert artist name
		expect(getByText("U2")).toBeTruthy();

		// Assert album cover image
		const albumCover = getByTestId("album-cover-image");
		expect(albumCover.props.source.uri).toBe(songListProps.albumCoverUrl);

		// Assert song number
		expect(getByText("1")).toBeTruthy();

		// Assert current song highlight
		const songcontainer = getByTestId("song-container");
		expect(songcontainer.props.style).toContainEqual(styles.currentSong);

		// Assert more button
		const moreButton = getByTestId("more-button");
		fireEvent.press(moreButton);
		// Add assertions for the actions triggered by pressing the more button
	});
});
