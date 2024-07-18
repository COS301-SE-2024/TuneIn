import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Image } from "react-native";
import TopNavBar from "../app/components/TopNavBar";

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

// Mock Utils module
jest.mock("../app/services/Utils", () => ({
	API_BASE_URL: "https://example.com/api",
}));

describe("TopNavBar component", () => {
	it("renders correctly with default profile image", async () => {
		const { getByTestId } = render(<TopNavBar />);

		// Assert profile image is rendered with the correct URI
		const profileImage = getByTestId("profile-image") as Image;
		expect(profileImage.props.source).toEqual({
			uri: "https://cdn-.jk.-png.freepik.com/512/3135/3135715.png",
		});
	});

	it("navigates to ProfilePage when profile image is clicked", async () => {
		const { getByTestId } = render(<TopNavBar />);

		// Simulate click on profile image
		const profileImage = getByTestId("profile-image");
		fireEvent.press(profileImage);

		// Assert useRouter push function is called
		expect(require("expo-router").useRouter().push).toHaveBeenCalledTimes(1);
		expect(require("expo-router").useRouter().push).toHaveBeenCalledWith({
			pathname: "/screens/ProfilePage",
		});
	});
});
