import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditRoom from "../../app/screens/rooms/EditRoom"; // Adjust the import based on your file structure
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import uploadImage from "../../app/services/ImageUpload";
import auth from "../../app/services/AuthManagement";

// Mocking dependencies
jest.mock("@react-navigation/native", () => ({
	useRoute: jest.fn(),
}));

jest.mock("expo-router", () => ({
	useRouter: jest.fn(), // Mocking useRouter from expo-router
}));

jest.mock("expo-image-picker", () => ({
	launchImageLibraryAsync: jest.fn(),
}));

jest.mock("../../app/services/ImageUpload");
jest.mock("../../app/services/AuthManagement");

describe("EditRoom Component", () => {
	const mockRoomData = {
		id: "1",
		name: "Test Room",
		description: "This is a test room",
		backgroundImage: "http://example.com/image.jpg",
		language: "English",
		tags: [],
		userID: "user123",
		isExplicit: false,
		isNsfw: false,
	};

	beforeEach(() => {
		(useRoute as jest.Mock).mockReturnValue({
			params: { room: JSON.stringify(mockRoomData) },
		});

		(uploadImage as jest.Mock).mockResolvedValue(
			"http://example.com/newImage.jpg",
		);
		(auth.getToken as jest.Mock).mockResolvedValue("mocked_token");
	});

	it("renders correctly", () => {
		const { getByText, getByPlaceholderText } = render(<EditRoom />);

		expect(getByText("Edit Room Details")).toBeTruthy();
		expect(getByPlaceholderText("Add room name")).toBeTruthy();
		expect(getByPlaceholderText("Add description")).toBeTruthy();
	});

	it("handles input changes", () => {
		const { getByPlaceholderText } = render(<EditRoom />);

		const roomNameInput = getByPlaceholderText("Add room name");
		fireEvent.changeText(roomNameInput, "New Room Name");
		expect(roomNameInput.props.value).toBe("New Room Name");

		const descriptionInput = getByPlaceholderText("Add description");
		fireEvent.changeText(descriptionInput, "New Description");
		expect(descriptionInput.props.value).toBe("New Description");
	});
});
