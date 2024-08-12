import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react-native";
import SongCard from "../../app/components/Spotify/SongCard"; // Adjust the import path as necessary
import { Audio } from "expo-av";
// Mock the Audio module from expo-av
jest.mock("expo-av", () => ({
	Audio: {
		Sound: {
			createAsync: jest.fn().mockResolvedValue({
				sound: {
					playAsync: jest.fn(),
					pauseAsync: jest.fn(),
					unloadAsync: jest.fn(),
					setOnPlaybackStatusUpdate: jest.fn(),
				},
			}),
		},
		setAudioModeAsync: jest.fn(),
		setIsEnabledAsync: jest.fn(),
	},
}));

describe("SongCard", () => {
	const track = {
		id: "1",
		name: "Track Name",
		artists: [{ name: "Artist Name" }],
		album: { images: [{ url: "https://example.com/album-art.jpg" }] },
		explicit: true,
		preview_url: "https://example.com/preview.mp3",
	};

	const onAdd = jest.fn();
	const onRemove = jest.fn();

	it("renders correctly", () => {
		render(
			<SongCard
				track={track}
				onAdd={onAdd}
				onRemove={onRemove}
				isAdded={false}
			/>,
		);

		expect(screen.getByText("Track Name")).toBeTruthy();
		expect(screen.getByText("Artist Name")).toBeTruthy();
		expect(screen.getByText("Explicit")).toBeTruthy();
	});

	it("plays audio when play button is pressed", async () => {
		const { getByTestId } = render(
			<SongCard
				track={track}
				onAdd={onAdd}
				onRemove={onRemove}
				isAdded={false}
			/>,
		);

		const playButton = getByTestId("play-pause-button");
		await act(async () => {
			fireEvent.press(playButton);
		});

		expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
			{ uri: track.preview_url },
			{ shouldPlay: true },
		);
	});

	it("pauses audio when pause button is pressed", async () => {
		const { sound } = await Audio.Sound.createAsync(
			{ uri: track.preview_url },
			{ shouldPlay: true },
		);
		render(
			<SongCard
				track={track}
				onAdd={onAdd}
				onRemove={onRemove}
				isAdded={false}
			/>,
		);

		const playButton = screen.getByTestId("play-pause-button");

		// Simulate audio being playing
		const mockStatus = {
			isLoaded: true,
			isPlaying: true,
			didJustFinish: false,
			// Add other properties if needed
		};

		// Mock the playback status update function
		(sound.setOnPlaybackStatusUpdate as jest.Mock).mockImplementation(
			(callback) => {
				callback(mockStatus as any); // Use `as any` to bypass type check
			},
		);

		await act(async () => {
			fireEvent.press(playButton); // Pause button press
		});
	});

	it("calls onAdd when add button is pressed", () => {
		render(
			<SongCard
				track={track}
				onAdd={onAdd}
				onRemove={onRemove}
				isAdded={false}
			/>,
		);

		const addButton = screen.getByText("+");
		fireEvent.press(addButton);

		expect(onAdd).toHaveBeenCalled();
	});

	it("calls onRemove when remove button is pressed", () => {
		render(
			<SongCard
				track={track}
				onAdd={onAdd}
				onRemove={onRemove}
				isAdded={true}
			/>,
		);

		const removeButton = screen.getByText("-");
		fireEvent.press(removeButton);

		expect(onRemove).toHaveBeenCalled();
	});
});
