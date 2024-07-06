// EditRoom.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EditRoom from '../app/screens/rooms/EditRoom';
import { Room } from '../app/models/Room';

// Mock the router and useLocalSearchParams hooks
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn().mockReturnValue({
		room: JSON.stringify({
			name: "Room Name",
			songName: "Song Name",
			artistName: "Artist Name",
			description: "Description of the room",
			tags: ["tag1", "tag2"],
		}),
	}),
}));

describe("EditRoom", () => {
	it("renders correctly with valid room data", () => {
		const room: Room = {
			backgroundImage: "url-to-background-image",
			name: "Room Name",
			songName: "Song Name",
			artistName: "Artist Name",
			description: "Description of the room",
			tags: ["tag1", "tag2"],
		};

		(useLocalSearchParams as jest.Mock).mockReturnValue({
			room: JSON.stringify(room),
		});

		const { getByText, getByDisplayValue } = render(<EditRoom />);

		expect(getByText("Edit Room")).toBeTruthy();
		expect(getByDisplayValue("Room Name")).toBeTruthy();
		expect(getByDisplayValue("Song Name")).toBeTruthy();
		expect(getByDisplayValue("Artist Name")).toBeTruthy();
		expect(getByDisplayValue("Description of the room")).toBeTruthy();
		expect(getByDisplayValue("tag1, tag2")).toBeTruthy();
	});

	it("handles text input correctly", () => {
		const room: Room = {
			backgroundImage: "url-to-background-image",
			name: "Room Name",
			songName: "Song Name",
			artistName: "Artist Name",
			description: "Description of the room",
			tags: ["tag1", "tag2"],
		};

		(useLocalSearchParams as jest.Mock).mockReturnValue({
			room: JSON.stringify(room),
		});

		const { getByDisplayValue } = render(<EditRoom />);

		const nameInput = getByDisplayValue("Room Name");
		const newRoomName = "New Room Name";
		fireEvent.changeText(nameInput, newRoomName);
		expect(nameInput.props.value).toBe(newRoomName);

		const songNameInput = getByDisplayValue("Song Name");
		const newSongName = "New Song Name";
		fireEvent.changeText(songNameInput, newSongName);
		expect(songNameInput.props.value).toBe(newSongName);

		const artistNameInput = getByDisplayValue("Artist Name");
		const newArtistName = "New Artist Name";
		fireEvent.changeText(artistNameInput, newArtistName);
		expect(artistNameInput.props.value).toBe(newArtistName);

		const descriptionInput = getByDisplayValue("Description of the room");
		const newDescription = "New Description";
		fireEvent.changeText(descriptionInput, newDescription);
		expect(descriptionInput.props.value).toBe(newDescription);

		const tagsInput = getByDisplayValue("tag1, tag2");
		const newTags = "tag3, tag4";
		fireEvent.changeText(tagsInput, newTags);
		expect(tagsInput.props.value).toBe(newTags);
	});

	describe("<EditRoom />", () => {
		it("calls handleSave when Save button is pressed", () => {
			const back = jest.fn();
			(useRouter as jest.Mock).mockReturnValue({ back });

			const { getByText } = render(<EditRoom />);

			const saveButton = getByText("Save");
			fireEvent.press(saveButton);

			expect(back).toHaveBeenCalled();
		});
	});
});
