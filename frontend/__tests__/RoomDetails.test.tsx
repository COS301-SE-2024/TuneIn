/* eslint-disable no-undef */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoomDetails from "../app/screens/rooms/RoomDetails"; // Adjust the import path accordingly
import { useRouter, useLocalSearchParams } from "expo-router"; // Import both hooks
// import * as ImagePicker from "expo-image-picker";
// import * as utils from "../app/services/Utils";
// import auth from "../app/services/AuthManagement";
// import uploadImage from "../app/services/ImageUpload";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
	launchImageLibraryAsync: jest.fn(),
}));

jest.mock("../app/services/ImageUpload");
jest.mock("../app/services/AuthManagement");
jest.mock("../app/services/Utils", () => ({
	API_BASE_URL: "https://example.com/api",
}));

describe("RoomDetails Component", () => {
	let mockRouter;

	beforeEach(() => {
		mockRouter = { navigate: jest.fn(), back: jest.fn() };
		useRouter.mockReturnValue(mockRouter);

		// Mock return value for useLocalSearchParams
		useLocalSearchParams.mockReturnValue({
			room: JSON.stringify({ name: "Test Room" }),
		});
	});

	it("renders RoomDetails correctly", () => {
		const { getByText, getByPlaceholderText } = render(<RoomDetails />);

		expect(getByText("Room Details")).toBeTruthy();
		expect(getByPlaceholderText("Add room name (required)")).toBeTruthy();
		expect(getByPlaceholderText("Add description")).toBeTruthy();
		expect(getByPlaceholderText("Add genre")).toBeTruthy();
		expect(getByPlaceholderText("Add language")).toBeTruthy();
	});

	// it("shows an alert if room name is not provided", async () => {
	// 	const { getByText } = render(<RoomDetails />);
	// 	const createButton = getByText("Share");

	// 	fireEvent.press(createButton);

	// 	await waitFor(() => {
	// 		expect(Alert.alert).toHaveBeenCalledWith(
	// 			"Room Name Required",
	// 			"Please enter a room name.",
	// 			[{ text: "OK" }],
	// 			{ cancelable: false },
	// 		);
	// 	});
	// });

	it("updates room details when input fields change", () => {
		const { getByPlaceholderText } = render(<RoomDetails />);

		const nameInput = getByPlaceholderText("Add room name (required)");
		fireEvent.changeText(nameInput, "My Room");

		expect(nameInput.props.value).toBe("My Room");
	});

	// it('calls image picker when "Select Photo" is pressed', async () => {
	// 	ImagePicker.launchImageLibraryAsync.mockResolvedValue({
	// 		canceled: false,
	// 		assets: [{ uri: "image-uri" }],
	// 	});

	// 	const { getByText } = render(<RoomDetails />);
	// 	const selectPhotoButton = getByText("Select Photo");

	// 	fireEvent.press(selectPhotoButton);

	// 	await waitFor(() => {
	// 		expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
	// 	});
	// });

	// it('uploads the image and navigates to Home when "Share" is pressed', async () => {
	// 	const mockImageUrl = "http://example.com/image.jpg";
	// 	uploadImage.mockResolvedValue(mockImageUrl);
	// 	auth.getToken.mockResolvedValue("mockToken");

	// 	fetch.mockResponseOnce(JSON.stringify({ roomID: "123" }));

	// 	const { getByText, getByPlaceholderText } = render(<RoomDetails />);

	// 	fireEvent.changeText(
	// 		getByPlaceholderText("Add room name (required)"),
	// 		"My Room",
	// 	);
	// 	fireEvent.press(getByText("Share"));

	// 	await waitFor(() => {
	// 		expect(uploadImage).toHaveBeenCalledWith("image-uri", "My Room");
	// 		expect(mockRouter.navigate).toHaveBeenCalledWith({
	// 			pathname: "/screens/(tabs)/Home",
	// 			params: { roomID: "123" },
	// 		});
	// 	});
	// });
});
