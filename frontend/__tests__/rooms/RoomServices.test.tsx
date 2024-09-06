import { Alert } from "react-native";
import uploadImage from "../../app/services/ImageUpload";
import auth from "../../app/services/AuthManagement";
import * as utils from "../../app/services/Utils";
import { createRoom } from "../../app/services/RoomService"; // Update the import path
import { RoomDetailsProps } from "../../app/models/roomdetails";

// Mock modules
jest.mock("../../app/services/ImageUpload", () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock("../../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(),
	},
}));

jest.mock("../../app/services/Utils", () => ({
	__esModule: true,
	API_BASE_URL: "http://mockapi.com",
}));

jest.mock("react-native", () => ({
	Alert: {
		alert: jest.fn(),
	},
}));

describe("createRoom", () => {
	const navigate = jest.fn();

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should alert when room name is missing", async () => {
		const roomDetails: RoomDetailsProps = {
			name: "",
			description: "Description",
			isNsfw: false,
			language: "English",
			genre: "Genre",
			isExplicit: false,
			roomSize: "20",
		};

		await createRoom(roomDetails, null, navigate);

		expect(Alert.alert).toHaveBeenCalledWith(
			"Room Name Required",
			"Please enter a room name.",
			[{ text: "OK" }],
			{ cancelable: false },
		);
		expect(navigate).not.toHaveBeenCalled();
	});

	it("should handle image upload if provided", async () => {
		const roomDetails: RoomDetailsProps = {
			name: "Room Name",
			description: "Description",
			isNsfw: false,
			language: "English",
			genre: "Genre",
			isExplicit: false,
			roomSize: "20",
		};

		(uploadImage as jest.Mock).mockResolvedValue(
			"http://example.com/image.jpg",
		);

		const image = "path/to/image.jpg";
		(auth.getToken as jest.Mock).mockResolvedValue("mock-token");

		global.fetch = jest.fn().mockResolvedValue({
			json: jest.fn().mockResolvedValue({}),
		});

		await createRoom(roomDetails, image, navigate);

		expect(uploadImage).toHaveBeenCalledWith(image, roomDetails.name);
		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/rooms`,
			expect.any(Object),
		);
		expect(navigate).toHaveBeenCalledWith({
			pathname: "/screens/(tabs)/Home",
			params: {},
		});
	});

	it("should make a successful API request and navigate", async () => {
		const roomDetails: RoomDetailsProps = {
			name: "Room Name",
			description: "Description",
			isNsfw: false,
			language: "English",
			genre: "Genre",
			isExplicit: false,
			roomSize: "20",
		};

		(auth.getToken as jest.Mock).mockResolvedValue("mock-token");

		global.fetch = jest.fn().mockResolvedValue({
			json: jest.fn().mockResolvedValue({ someData: "value" }),
		});

		await createRoom(roomDetails, null, navigate);

		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/rooms`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer mock-token`,
				},
				body: JSON.stringify({
					has_nsfw_content: roomDetails.isNsfw,
					language: roomDetails.language || "English",
					genre: roomDetails.genre || undefined,
					description:
						roomDetails.description || "This room has no description.",
					has_explicit_content: roomDetails.isExplicit,
					room_name: roomDetails.name,
					room_image: "",
				}),
			},
		);
		expect(navigate).toHaveBeenCalledWith({
			pathname: "/screens/Home",
			params: { someData: "value" },
		});
	});

	it("should handle API request errors", async () => {
		const roomDetails: RoomDetailsProps = {
			name: "Room Name",
			description: "Description",
			isNsfw: false,
			language: "English",
			genre: "Genre",
			isExplicit: false,
			roomSize: "20",
		};

		(auth.getToken as jest.Mock).mockResolvedValue("mock-token");

		global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

		console.error = jest.fn(); // Mock console.error

		await createRoom(roomDetails, null, navigate);

		expect(console.error).toHaveBeenCalledWith(
			"Error:",
			new Error("Network error"),
		);
		expect(navigate).not.toHaveBeenCalled();
	});
});
