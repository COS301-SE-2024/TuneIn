import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import WelcomeScreen from "../app/screens/WelcomeScreen"; // Adjust the path as needed
import { useRouter } from "expo-router";
import { useAuthRequest } from "expo-auth-session";
import { useLive } from "../app/LiveContext";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
	makeRedirectUri: jest.fn().mockReturnValue("mock-redirect-uri"),
	useAuthRequest: jest.fn(),
	ResponseType: {
		Code: "code", // Mock ResponseType.Code here
	},
}));

jest.mock("../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

jest.mock("react-native-dotenv", () => ({
	SPOTIFY_CLIENT_ID: "mock-client-id",
	SPOTIFY_REDIRECT_URI: "mock-redirect-uri",
}));

describe("WelcomeScreen", () => {
	let mockRouter: { navigate: any },
		mockSpotifyAuth: { exchangeCodeWithBackend: any };

	beforeEach(() => {
		// Setup mock for router
		mockRouter = { navigate: jest.fn() };
		(useRouter as jest.Mock).mockReturnValue(mockRouter);

		// Mock Spotify authentication
		mockSpotifyAuth = {
			exchangeCodeWithBackend: jest.fn().mockResolvedValue({
				token: "mock-token",
			}),
		};
		(useLive as jest.Mock).mockReturnValue({ spotifyAuth: mockSpotifyAuth });

		// Mock useAuthRequest return value
		(useAuthRequest as jest.Mock).mockReturnValue([
			jest.fn(), // request function
			{ type: "success", params: { code: "mock-code", state: "mock-state" } }, // response
			jest.fn(), // promptAsync function
		]);
	});

	it("renders correctly and handles Spotify login", async () => {
		const { getByTestId } = render(<WelcomeScreen />);

		// Simulate pressing Spotify login button
		fireEvent.press(getByTestId("spotify-login-button"));

		// Ensure the promptAsync is triggered
		await waitFor(() => expect(useAuthRequest).toHaveBeenCalled());

		// Ensure token exchange is called
		await waitFor(() =>
			expect(mockSpotifyAuth.exchangeCodeWithBackend).toHaveBeenCalledWith(
				"mock-code",
				"mock-state",
				"mock-redirect-uri",
			),
		);

		// Ensure navigation to Home screen is called
		expect(mockRouter.navigate).toHaveBeenCalledWith("screens/(tabs)/Home");
	});

	it("shows help screen when help button is pressed", () => {
		const { getByTestId } = render(<WelcomeScreen />);

		// Simulate pressing help button
		fireEvent.press(getByTestId("help-button"));

		// Check if router navigates to Help screen
		expect(mockRouter.navigate).toHaveBeenCalledWith(
			"/screens/(tabs)/HelpScreen",
		);
	});
});
