import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Player } from "../app/PlayerContext";
import Miniplayer from "../app/components/home/miniplayer";
import { useRouter } from "expo-router";

// __mocks__/react-native.js
jest.mock("react-native", () => {
	const ReactNative = jest.requireActual("react-native");

	ReactNative.NativeModules.SettingsManager = {
		settings: {
			AppleLocale: "en_US",
			AppleLanguages: ["en"],
		},
		getSetting: jest.fn(),
	};

	return ReactNative;
});

// jest.setup.js or in your test file
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({
		push: jest.fn(),
		back: jest.fn(),
	})),
}));

jest.mock("react-native-vector-icons/FontAwesome", () => "Icon");

describe("Miniplayer", () => {
	const mockRouter = {
		push: jest.fn(),
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const mockContextValue = {
		NumberOfPeople: 5,
		currentRoom: {
			name: "Chill Vibes",
			songName: "Song Title",
			artistName: "Artist Name",
			backgroundImage: "https://example.com/image.jpg",
		},
	};

	it("navigates to the room page on press", () => {
		const { getByTestId } = render(
			<Player.Provider value={mockContextValue}>
				<Miniplayer />
			</Player.Provider>,
		);

		const touchable = getByTestId("player-touchable");
		fireEvent.press(touchable);

		expect(mockRouter.push).toHaveBeenCalledWith({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(mockContextValue.currentRoom) },
		});
	});

	it("does not render when currentRoom is null", () => {
		const { queryByTestId } = render(
			<Player.Provider value={{ ...mockContextValue, currentRoom: null }}>
				<Miniplayer />
			</Player.Provider>,
		);

		expect(queryByTestId("player-touchable")).toBeNull();
	});
});
