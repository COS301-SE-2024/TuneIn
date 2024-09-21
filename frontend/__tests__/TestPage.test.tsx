import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import TestPage from "../app/screens/Testpage"; // Adjust the import path for TestPage
import SplittingPopUp from "../app/components/rooms/SplittingRoomPopUp";

// Mock useRouter from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// Mock SplittingPopUp since it's imported as a component
jest.mock("../app/components/rooms/SplittingRoomPopUp", () =>
	jest.fn(() => null),
);

describe("TestPage Component", () => {
	const mockNavigate = jest.fn();

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
		});
	});

	it("renders the component with buttons", () => {
		const { getByText } = render(<TestPage />);

		expect(getByText("Test Page")).toBeTruthy();
		expect(getByText("Go to SplittingRoom")).toBeTruthy();
		expect(getByText("Test Popup")).toBeTruthy();
	});

	it("navigates to SplittingRoom when 'Go to SplittingRoom' is pressed", () => {
		const { getByText } = render(<TestPage />);

		const goToSplittingRoomButton = getByText("Go to SplittingRoom");
		fireEvent.press(goToSplittingRoomButton);

		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/screens/rooms/SplittingRoom",
			params: {
				rooms: JSON.stringify([
					{
						id: "1",
						backgroundImage:
							"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmCy16nhIbV3pI1qLYHMJKwbH2458oiC9EmA&s",
						name: "Test Room One",
						description: "This is a description for Test Room One.",
						userID: "user1",
						username: "User One",
						tags: ["chill", "jazz"],
						genre: "Jazz",
						language: "English",
						roomSize: 10,
						isExplicit: false,
						isNsfw: false,
					},
					{
						id: "2",
						name: "Test Room Two",
						description: "This is a description for Test Room Two.",
						userID: "user2",
						username: "User Two",
						tags: ["pop", "party"],
						genre: "Pop",
						language: "English",
						roomSize: 20,
						isExplicit: true,
						isNsfw: false,
					},
				]),
				queues: JSON.stringify([
					[
						{
							id: 1,
							name: "Track One",
							artists: [{ name: "Artist A" }],
							album: { images: [{ url: "https://example.com/album1.jpg" }] },
							explicit: false,
							preview_url: "https://example.com/preview1.mp3",
							uri: "spotify:track:1",
							duration_ms: 210000,
						},
						{
							id: 2,
							name: "Track Two",
							artists: [{ name: "Artist B" }],
							album: { images: [{ url: "https://example.com/album2.jpg" }] },
							explicit: true,
							preview_url: "https://example.com/preview2.mp3",
							uri: "spotify:track:2",
							duration_ms: 180000,
						},
					],
					[
						{
							id: 3,
							name: "Track Three",
							artists: [{ name: "Artist C" }],
							album: { images: [{ url: "https://example.com/album3.jpg" }] },
							explicit: false,
							preview_url: "https://example.com/preview3.mp3",
							uri: "spotify:track:3",
							duration_ms: 200000,
						},
						{
							id: 4,
							name: "Track Four",
							artists: [{ name: "Artist D" }],
							album: { images: [{ url: "https://example.com/album4.jpg" }] },
							explicit: true,
							preview_url: "https://example.com/preview4.mp3",
							uri: "spotify:track:4",
							duration_ms: 240000,
						},
					],
				]),
			},
		});
	});

	it("opens the popup when 'Test Popup' button is pressed", () => {
		const { getByText } = render(<TestPage />);

		const testPopupButton = getByText("Test Popup");
		fireEvent.press(testPopupButton);

		// Expect that SplittingPopUp is rendered with visible state as true
		expect(SplittingPopUp).toHaveBeenCalledWith(
			expect.objectContaining({ isVisible: true }),
			{},
		);
	});

	it("closes the popup when the user cancels", async () => {
		// Simulate SplittingPopUp calling the onClose prop
		(SplittingPopUp as jest.Mock).mockImplementation(({ onClose }) => {
			onClose();
			return null;
		});

		const { getByText } = render(<TestPage />);

		const testPopupButton = getByText("Test Popup");
		fireEvent.press(testPopupButton);

		// Simulate user clicking "No" on the popup, triggering onClose
		expect(SplittingPopUp).toHaveBeenCalledWith(
			expect.objectContaining({
				onClose: expect.any(Function),
			}),
			{},
		);

		// Ensure the popup is closed
		await waitFor(() => expect(SplittingPopUp).toHaveBeenCalledTimes(4));
	});
});
