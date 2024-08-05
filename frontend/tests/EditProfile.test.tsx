import React from "react";
import { render } from "@testing-library/react-native";
import EditProfileScreen from "../app/screens/profile/EditProfilePage"; // Adjust the import path accordingly
import { useNavigation, useLocalSearchParams } from "expo-router";
import auth from "../app/services/AuthManagement";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

// Mock the AuthManagement module
jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

const mockProfileInfo = {
	profile_picture_url:
		"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/1718985422543-diamond.jpeg",
	profile_name: "John Doe",
	username: "johndoe",
	bio: "This is a bio",
	links: "value",
	fav_genres: "value",
	fav_songs: "value",
};

// Mock useNavigation from expo-router
jest.mock("expo-router", () => {
	const actualModule = jest.requireActual("expo-router");
	return {
		...actualModule,
		useNavigation: jest.fn(),
		useLocalSearchParams: jest.fn().mockReturnValue({
			profile: JSON.stringify(mockProfileInfo),
		}),
	};
});

describe("<EditProfileScreen />", () => {
	it("renders correctly with valid friend data", async () => {
		const goBack = jest.fn();
		(useNavigation as jest.Mock).mockReturnValue({ goBack });
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			profile: JSON.stringify(mockProfileInfo),
		});
		(auth.getToken as jest.Mock).mockReturnValue("token"); // Mock the token for the test

		const { getByText } = render(<EditProfileScreen />);

		expect(useLocalSearchParams).toHaveBeenCalled();

		expect(getByText("John Doe")).toBeTruthy();
		expect(getByText("This is a bio")).toBeTruthy();
		expect(getByText("@johndoe")).toBeTruthy();
	});
});
