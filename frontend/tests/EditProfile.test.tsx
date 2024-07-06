import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditProfile from "../app/screens/profile/EditProfilePage"; // Adjust the import path accordingly
import { useNavigation, useLocalSearchParams } from "expo-router";

// Mock useNavigation from expo-router
jest.mock("expo-router", () => ({
	useNavigation: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

describe("<EditProfile />", () => {
	it("renders correctly with valid friend data", () => {
		const goBack = jest.fn();
		(useNavigation as jest.Mock).mockReturnValue({ goBack });
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({
				profilePicture: "https://example.com/profile.jpg",
				name: "John Doe",
			}),
		});

		const { getByText, getByTestId } = render(<EditProfile />);

		expect(getByText("< Back")).toBeTruthy();
		expect(getByTestId("friend-profile-image")).toBeTruthy();
		expect(getByText("John Doe")).toBeTruthy();
	});

	it("calls goBack when Back button is pressed", () => {
		const goBack = jest.fn();
		(useNavigation as jest.Mock).mockReturnValue({ goBack });
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({
				profilePicture: "https://example.com/profile.jpg",
				name: "John Doe",
			}),
		});

		const { getByText } = render(<EditProfile />);

		const backButton = getByText("< Back");
		fireEvent.press(backButton);

		expect(goBack).toHaveBeenCalled();
	});
});
