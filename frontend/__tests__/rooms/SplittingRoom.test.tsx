import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SplittingRoom from "../../app/screens/rooms/SplittingRoom";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Animated } from "react-native";

// Mock dependencies
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("react-native-vector-icons/FontAwesome", () => "Icon");

// Correctly mock Animated.event to avoid type errors
Animated.event = jest.fn(() => () => {});

describe("SplittingRoom Component", () => {
	const mockRouter = { navigate: jest.fn() };
	const roomsMockData = JSON.stringify([
		{
			roomID: 1,
			name: "Room 1",
			backgroundImage: "",
			tags: ["Pop"],
			roomSize: 5,
		},
		{
			roomID: 2,
			name: "Room 2",
			backgroundImage: "",
			tags: ["Rock"],
			roomSize: 10,
		},
	]);
	const queuesMockData = JSON.stringify({
		"1": [
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
		"2": [
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
	});

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			rooms: roomsMockData,
			queues: queuesMockData,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly with initial data", () => {
		const { getByText } = render(<SplittingRoom />);

		// Check if the room names are rendered
		expect(getByText("Room 1")).toBeTruthy();
		expect(getByText("Room 2")).toBeTruthy();

		// Check if the queue is initially empty
		expect(getByText("Track One")).toBeTruthy();
	});

	it("navigates to RoomPage on room press", () => {
		const { getByText } = render(<SplittingRoom />);

		// Simulate pressing the first room card
		fireEvent.press(getByText("Room 1"));

		expect(mockRouter.navigate).toHaveBeenCalledWith({
			pathname: "/screens/rooms/RoomPage",
			params: {
				room: JSON.stringify({
					backgroundImage: "",
					name: "Room 1",
					songName: null,
					artistName: null,
					userProfile:
						"https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg",
					username: "Unknown",
					roomSize: 55,
					genre: null,
					tags: ["Pop"],
				}),
			},
		});
	});

	it("collapses and expands the queue drawer on tap", async () => {
		const { getByText, getByTestId } = render(<SplittingRoom />);

		// Initially, the drawer is expanded
		const drawerTitle = getByText("Queue");

		// Collapse the drawer
		fireEvent.press(drawerTitle);

		// Wait for the animation to complete and check icon name directly
		await waitFor(() => {
			const drawerIcon = getByTestId("drawer-icon");
			console.log(drawerIcon.props); // Debugging line
			expect(drawerIcon).toBeTruthy(); // Check if drawerIcon exists
			expect(drawerIcon.props.name).toBe("chevron-up");
		});

		// Expand the drawer
		fireEvent.press(drawerTitle);

		// Wait for the animation to complete and check icon name directly
		await waitFor(() => {
			const drawerIcon = getByTestId("drawer-icon");
			console.log(drawerIcon.props); // Debugging line
			expect(drawerIcon).toBeTruthy(); // Check if drawerIcon exists
			expect(drawerIcon.props.name).toBe("chevron-down");
		});
	});
});
