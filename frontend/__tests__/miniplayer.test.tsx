import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { Animated } from "react-native";
import { PlayerContextProvider, Player } from "../app/PlayerContext";
import Miniplayer from "../app/components/home/miniplayer";
import { useRouter } from "expo-router";

// Mock Animated API for the test
jest.mock("react-native", () => {
	const actualRn = jest.requireActual("react-native");
	return {
		...actualRn,
		Animated: {
			...actualRn.Animated,
			loop: jest.fn(() => ({ start: jest.fn() })),
			timing: jest.fn(() => ({ start: jest.fn() })),
		},
	};
});

// Mock useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("Miniplayer Component", () => {
	const mockContextValue = {
		NumberOfPeople: 5,
		currentRoom: {
			name: "Test Room",
			songName: "Test Song",
			artistName: "Test Artist",
			backgroundImage: "https://example.com/image.jpg",
		},
		setNumberOfPeople: jest.fn(),
		currentTrack: null,
		setCurrentTrack: jest.fn(),
		currentTrackIndex: null,
		setCurrentTrackIndex: jest.fn(),
		setCurrentRoom: jest.fn(),
		trackName: null,
		setTrackName: jest.fn(),
		artistName: null,
		setArtistName: jest.fn(),
		albumArt: null,
		setAlbumArt: jest.fn(),
	};

	beforeEach(() => {
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: pushMock });
	});

	test("renders correctly with context values", () => {
		render(
			<PlayerContextProvider>
				<Miniplayer />
			</PlayerContextProvider>,
		);

		// Verify the components are rendered with the context values
		expect(screen.getByText("Test Room")).toBeTruthy();
		expect(screen.getByText("Test Song · Test Artist")).toBeTruthy();
		expect(screen.getByText("5")).toBeTruthy();
	});

	test("navigates to RoomPage when player is clicked", () => {
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: pushMock });

		render(
			<PlayerContextProvider>
				<Miniplayer />
			</PlayerContextProvider>,
		);

		const miniplayerTouchable = screen.getByRole("button");
		fireEvent.press(miniplayerTouchable);

		expect(pushMock).toHaveBeenCalledWith({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(mockContextValue.currentRoom) },
		});
	});

	test("handles empty context values gracefully", () => {
		// Override context values with empty values
		const emptyContextValue = {
			NumberOfPeople: null,
			currentRoom: null,
			setNumberOfPeople: jest.fn(),
			currentTrack: null,
			setCurrentTrack: jest.fn(),
			currentTrackIndex: null,
			setCurrentTrackIndex: jest.fn(),
			setCurrentRoom: jest.fn(),
			trackName: null,
			setTrackName: jest.fn(),
			artistName: null,
			setArtistName: jest.fn(),
			albumArt: null,
			setAlbumArt: jest.fn(),
		};

		render(
			<Player.Provider value={emptyContextValue}>
				<Miniplayer />
			</Player.Provider>,
		);

		// Ensure that nothing breaks when context values are null
		expect(screen.queryByText("Test Room")).toBeNull();
		expect(screen.queryByText("Test Song · Test Artist")).toBeNull();
		expect(screen.queryByText("5")).toBeNull();
	});

	test("handles animation when song name and artist name combined length is > 19", () => {
		// Override context values with long song and artist names
		const longTextContextValue = {
			NumberOfPeople: 5,
			currentRoom: {
				name: "Test Room",
				songName: "A very long song name that definitely exceeds 19 characters",
				artistName: "Artist with long name",
				backgroundImage: "https://example.com/image.jpg",
			},
			setNumberOfPeople: jest.fn(),
			currentTrack: null,
			setCurrentTrack: jest.fn(),
			currentTrackIndex: null,
			setCurrentTrackIndex: jest.fn(),
			setCurrentRoom: jest.fn(),
			trackName: null,
			setTrackName: jest.fn(),
			artistName: null,
			setArtistName: jest.fn(),
			albumArt: null,
			setAlbumArt: jest.fn(),
		};

		render(
			<Player.Provider value={longTextContextValue}>
				<Miniplayer />
			</Player.Provider>,
		);

		// Verify animation is triggered by checking for animated text
		expect(
			screen.getByText(
				"A very long song name that definitely exceeds 19 characters · Artist with long name",
			),
		).toBeTruthy();
	});

	test("throws error when PlayerContext is not provided", () => {
		// Render Miniplayer without PlayerContextProvider to test error handling
		const consoleError = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => render(<Miniplayer />)).toThrow(
			"PlayerContext must be used within a PlayerContextProvider",
		);

		consoleError.mockRestore();
	});
});
