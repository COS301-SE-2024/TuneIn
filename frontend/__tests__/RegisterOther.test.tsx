import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RegisterOtherScreen from "../app/screens/Auth/RegisterOther"; // Adjust the path as necessary
import { useRouter } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
	...jest.requireActual("expo-auth-session"),
	makeRedirectUri: jest.fn(() => "mocked-uri"),
}));

describe("RegisterOtherScreen", () => {
	const mockNavigate = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
			back: jest.fn(),
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('navigates to LoginOther screen when "Login Now!" is pressed', () => {
		const { getByText } = render(<RegisterOtherScreen />);

		// Simulate press event on "Login Now!" text
		fireEvent.press(getByText("Login Now!"));

		// Check that the navigate function was called with the correct screen
		expect(mockNavigate).toHaveBeenCalledWith("screens/Auth/LoginOther");
	});
});
