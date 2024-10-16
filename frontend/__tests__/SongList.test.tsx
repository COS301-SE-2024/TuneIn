import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import SongList from "../app/components/SongList"; // Adjust the import path based on your structure
import { useLive } from "../app/LiveContext";
import { RoomSongDto } from "../api";

// Mock `useLive` to provide custom values for testing
jest.mock("../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

describe("SongList Component", () => {
	const mockRoomControls = {
		queue: {
			upvoteSong: jest.fn(),
			downvoteSong: jest.fn(),
			undoSongVote: jest.fn(),
			swapSongVote: jest.fn(),
		},
	};

	const mockSong = {
		song: {
			spotifyID: "song123",
			score: 5,
			index: 1,
		},
		track: {
			id: "track123",
			name: "Test Song",
			artists: [{ name: "Test Artist" }],
		},
	};

	const mockUser = {
		userID: "user123",
	};

	const mockRoomQueue: RoomSongDto[] = [
		{
			spotifyID: "song123",
			score: 5,
		},
	];

	const mockCurrentRoomVotes = [
		{
			spotifyID: "track123",
			userID: "user123",
			isUpvote: true,
		},
	];

	beforeEach(() => {
		(useLive as jest.Mock).mockReturnValue({
			roomControls: mockRoomControls,
			currentUser: mockUser,
			currentSong: mockRoomQueue[0],
			roomQueue: mockRoomQueue,
			currentRoomVotes: mockCurrentRoomVotes,
		});
	});

	it("renders song details correctly", () => {
		render(<SongList song={mockSong} showVoting={true} />);

		const songTitle = screen.getByText("Test Song");
		const songArtist = screen.getByText("Test Artist");

		expect(songTitle).toBeTruthy();
		expect(songArtist).toBeTruthy();
	});

	it("renders without voting controls when showVoting is false", () => {
		render(<SongList song={mockSong} showVoting={false} />);

		const upvoteButton = screen.queryByTestId("upvote-button");
		const downvoteButton = screen.queryByTestId("downvote-button");

		expect(upvoteButton).toBeNull();
		expect(downvoteButton).toBeNull();
	});
});
