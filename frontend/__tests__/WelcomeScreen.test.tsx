import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import WelcomeScreen from "../app/screens/WelcomeScreen"; // Update this path accordingly
import { ToastAndroid } from "react-native";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// Mock the makeRedirectUri function from expo-auth-session
jest.mock("expo-auth-session", () => ({
	...jest.requireActual("expo-auth-session"),
	makeRedirectUri: jest.fn(() => "mocked-uri"),
	ResponseType: {
		Code: "code", // Mock the ResponseType with the Code property
	},
}));

// Mock the exchangeCodeWithBackend function from SpotifyAuth
jest.mock("../app/services/SpotifyAuth", () => ({
	exchangeCodeWithBackend: jest.fn(),
}));

// Mock the auth and live services
jest.mock("../app/services/AuthManagement", () => ({
	setToken: jest.fn(),
}));
jest.mock("../app/services/Live", () => ({
	initialiseSocket: jest.fn(),
}));

// // Mock Dimensions
// jest.mock("react-native", () => ({
// 	...jest.requireActual("react-native"),
// 	Dimensions: {
// 		get: jest.fn().mockReturnValue({ width: 375, height: 667 }), // You can adjust the dimensions as needed
// 	},
// }));

describe("WelcomeScreen", () => {
	const navigate = jest.fn();
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ navigate });
		jest.clearAllMocks();
	});

	it("should render correctly", () => {
		const { getByText } = render(<WelcomeScreen />);

		// Check if the buttons are rendered
		expect(getByText("Login With Spotify")).toBeTruthy();
	});

	it("should navigate to HelpScreen when help button is pressed", () => {
		const { getByTestId } = render(<WelcomeScreen />);
		const helpButton = getByTestId("help-button"); // Add testID to the TouchableOpacity for the help button

		fireEvent.press(helpButton);
		expect(navigate).toHaveBeenCalledWith("/screens/(tabs)/HelpScreen");
	});

	// it("should navigate to the Home screen on successful authentication", async () => {
	// 	// Mock useAuthRequest to return a successful response
	// 	const mockPromptAsync = jest.fn();
	// 	const mockResponse = {
	// 		type: "success",
	// 		params: { code: "auth-code", state: "auth-state" },
	// 	};

	// 	const mockRequest = {};
	// 	const mockScopes = "user-read-email";
	// 	require("expo-auth-session").useAuthRequest.mockReturnValue([
	// 		mockRequest,
	// 		mockResponse,
	// 		mockPromptAsync,
	// 	]);

	// 	// Mock the exchangeCodeWithBackend to return the token
	// 	const mockExchangeCodeWithBackend =
	// 		require("../app/services/SpotifyAuth").exchangeCodeWithBackend;
	// 	mockExchangeCodeWithBackend.mockResolvedValueOnce({ token: "mock-token" });

	// 	const { getByText } = render(<WelcomeScreen />);

	// 	// Wait for the effect to finish
	// 	await waitFor(() => {
	// 		expect(mockExchangeCodeWithBackend).toHaveBeenCalledWith(
	// 			"auth-code",
	// 			"auth-state",
	// 			"mocked-uri",
	// 		);
	// 	});

	// 	// Check that the token was set and live socket was initialized
	// 	expect(require("../app/services/AuthManagement").setToken).toHaveBeenCalledWith(
	// 		"mock-token",
	// 	);
	// 	expect(require("../app/services/Live").initialiseSocket).toHaveBeenCalled();

	// 	// Check that navigation to Home happened
	// 	expect(navigate).toHaveBeenCalledWith("screens/(tabs)/Home");
	// });

	// it("should show an error toast on authentication failure", async () => {
	// 	// Mock the useAuthRequest to return an error response
	// 	const mockPromptAsync = jest.fn();
	// 	const mockResponse = {
	// 		type: "error",
	// 		params: { error: "access_denied" },
	// 	};

	// 	const mockUseAuthRequest = require("expo-auth-session").useAuthRequest;
	// 	mockUseAuthRequest.mockReturnValue([{}, mockResponse, mockPromptAsync]);

	// 	// Spy on ToastAndroid
	// 	const toastSpy = jest.spyOn(ToastAndroid, "show");

	// 	const { getByText } = render(<WelcomeScreen />);

	// 	// Wait for the effect to finish
	// 	await waitFor(() => {
	// 		expect(toastSpy).toHaveBeenCalledWith(
	// 			"Failed to authenticate. Please try again.",
	// 			ToastAndroid.SHORT,
	// 		);
	// 	});

	// 	// Check that the navigation did not happen
	// 	expect(navigate).not.toHaveBeenCalled();
	// });
});
