import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import TopNavBar from "../app/components/TopNavBar";
import { useRouter } from "expo-router";
import axios from "axios";
import auth from "../app/services/AuthManagement";
import * as utils from "../app/services/Utils";

// Mock useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn().mockReturnValue({
		push: jest.fn(),
	}),
}));

// Mock AuthManagement module
jest.mock("../app/services/AuthManagement", () => ({
	getToken: jest.fn().mockResolvedValue("mocked_token"),
}));

// Mock axios module
jest.mock("axios");

// Mock Utils module
jest.mock("../app/services/Utils", () => ({
	API_BASE_URL: "https://api.example.com",
}));

describe("TopNavBar component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly with default profile image", () => {
		const { getByTestId } = render(<TopNavBar />);

		// Assert profile image is rendered with the default URI
		const profileImage = getByTestId("profile-image");
		const imageSource = profileImage.props.source as { uri: string };
		expect(imageSource.uri).toBe(
			"https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
		);
	});

	it("updates profile image after fetching data", async () => {
		const mockResponse = {
			data: {
				profile_picture_url: "https://example.com/profile-image.jpg",
			},
		};

		// Mock axios.get to return the mock response without making a real request
		(axios.get as jest.Mock).mockResolvedValue(mockResponse);

		const { getByTestId } = render(<TopNavBar />);

		// Wait for the profile image to update
		await waitFor(() => {
			const profileImage = getByTestId("profile-image");
			const imageSource = profileImage.props.source as { uri: string };
			expect(imageSource.uri).toBe("https://example.com/profile-image.jpg");
		});
	});

	it("navigates to ProfilePage when profile image is clicked", () => {
		const { getByTestId } = render(<TopNavBar />);

		// Simulate click on profile image
		const profileImage = getByTestId("profile-image");
		fireEvent.press(profileImage);

		// Assert useRouter push function is called
		const { push } = useRouter();
		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith({
			pathname: "/screens/profile/ProfilePage",
		});
	});
});
