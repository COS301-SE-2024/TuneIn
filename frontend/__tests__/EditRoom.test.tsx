// EditRoom.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native"; // Import Alert from 'react-native'
import { useLocalSearchParams, useRouter } from "expo-router";
import EditRoom from "../app/screens/rooms/EditRoom";
import { Room } from "../app/models/Room";
import auth from "../app/services/AuthManagement";
import uploadImage from "../app/services/ImageUpload";

// Mock the router and useLocalSearchParams hooks
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn().mockReturnValue({
		room: JSON.stringify({
			name: "Room Name",
			description: "Description of the room",
			tags: ["tag1", "tag2"],
		}),
	}),
}));

describe("EditRoom", () => {
	it("renders correctly with valid room data", () => {
		const room: Room = {
			userID: "Test-userID",
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

		const { getByText } = render(<EditRoom />);

		expect(getByText("Edit Room Details")).toBeTruthy();
		expect(getByText("Room Name")).toBeTruthy();
		expect(getByText("Description")).toBeTruthy();
	});

	// it("handles text input correctly", () => {
	// 	const room: Room = {
	// 		userID: "Test-userID",
	// 		backgroundImage: "url-to-background-image",
	// 		name: "Room Name",
	// 		songName: "Song Name",
	// 		artistName: "Artist Name",
	// 		description: "Description of the room",
	// 		tags: ["tag1", "tag2"],
	// 	};

	// 	(useLocalSearchParams as jest.Mock).mockReturnValue({
	// 		room: JSON.stringify(room),
	// 	});

	// 	const { getByText } = render(<EditRoom />);

	// 	const nameInput = getByText("Room Name");
	// 	const newRoomName = "New Room Name";
	// 	fireEvent.changeText(nameInput, newRoomName);
	// 	console.log("nameInput : " + nameInput.props.value);
	// 	expect(nameInput.props.value).toBe(newRoomName);

	// 	const descriptionInput = getByText("Description of the room");
	// 	const newDescription = "New Description";
	// 	fireEvent.changeText(descriptionInput, newDescription);
	// 	expect(descriptionInput.props.value).toBe(newDescription);
	// });

	// describe("<EditRoom />", () => {
	// 	it("calls handleSave when Save button is pressed", async () => {
	// 		// Mock router and functions
	// 		const navigate = jest.fn();
	// 		const back = jest.fn();
	// 		(useRouter as jest.Mock).mockReturnValue({ back, navigate });

	// 		// Mock Alert.alert
	// 		const alertMock = jest.spyOn(Alert, "alert").mockImplementation(() => {});

	// 		// Mock functions
	// 		const token = "test-token";
	// 		(auth.getToken as jest.Mock).mockResolvedValue(token);
	// 		(uploadImage as jest.Mock).mockResolvedValue("new-image-url");
	// 		(fetch as jest.Mock).mockResolvedValue({
	// 			json: jest.fn().mockResolvedValue({}),
	// 		});

	// 		const { getByText } = render(<EditRoom />);

	// 		// Find and press the Save Changes button
	// 		const saveButton = getByText("Save Changes");
	// 		fireEvent.press(saveButton);

	// 		// Wait for async actions to complete
	// 		await waitFor(() => {
	// 			expect(fetch).toHaveBeenCalled();
	// 			expect(Alert.alert).toHaveBeenCalledWith(
	// 				"Changes Saved",
	// 				"Your changes have been saved successfully.",
	// 				[{ text: "OK" }],
	// 				{ cancelable: false },
	// 			);
	// 			expect(navigate).toHaveBeenCalledWith({
	// 				pathname: "/screens/Home",
	// 			});
	// 		});

	// 		// Cleanup mocks
	// 		jest.restoreAllMocks();
	// 	});
	// });
});
