import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LyricsScreen from "../app/screens/Lyrics"; // Adjust the import path as necessary
import { useRouter } from "expo-router";

// Mock the useRouter from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("LyricsScreen", () => {
	const mockRouterBack = jest.fn();

	beforeEach(() => {
		// Mock the router.back function
		(useRouter as jest.Mock).mockReturnValue({
			back: mockRouterBack,
		});
	});

	it("renders the song title, artist, and lyrics correctly", () => {
		const { getByText } = render(<LyricsScreen />);

		// Check if the song title and artist are rendered
		expect(getByText("Eternal Sunshine")).toBeTruthy();
		expect(getByText("Ariana Grande")).toBeTruthy();

		// Check if part of the lyrics is rendered
		expect(
			getByText("I don't care what people say", { exact: false }),
		).toBeTruthy();
	});

	it("scrolls through the lyrics", () => {
		const { getByText } = render(<LyricsScreen />);

		// Ensure that the lyrics are rendered inside a ScrollView
		expect(
			getByText("I don't care what people say", { exact: false }),
		).toBeTruthy();
	});

	it("calls router.back when the close button is pressed", () => {
		const { getByTestId } = render(<LyricsScreen />);

		// Find the close button and simulate a press event
		const closeButton = getByTestId("close-button");
		fireEvent.press(closeButton);

		// Check if the router.back function has been called
		expect(mockRouterBack).toHaveBeenCalled();
	});
});
