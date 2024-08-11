import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FriendsFollowing from "../app/screens/help/FriendsFollowing";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("FriendsFollowing", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		useRouter.mockReturnValue({
			back: mockBack,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders correctly", () => {
		const { getByText, getByTestId } = render(<FriendsFollowing />);

		// Check if the header and title are rendered
		expect(getByTestId("back-button")).toBeTruthy();
		expect(getByText("Friends and Following")).toBeTruthy();

		// Check if the Following card is rendered
		expect(getByText("Following")).toBeTruthy();
		expect(
			getByText(
				"Users can follow other users and keep up with their music taste through the activity feed.",
			),
		).toBeTruthy();

		// Check if the Friends card is rendered
		expect(getByText("Friends")).toBeTruthy();
		expect(
			getByText(
				"Users can also befriend each other by sending a friend request, which is only available once both users follow each other.",
			),
		).toBeTruthy();
	});

	test("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<FriendsFollowing />);

		fireEvent.press(getByTestId("back-button"));

		expect(mockBack).toHaveBeenCalled();
	});
});
