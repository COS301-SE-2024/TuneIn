import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoomOptions from "../../app/screens/rooms/RoomOptions";
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("RoomOptions Component", () => {
	const mockNavigate = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
			back: mockBack,
		});
	});

	it("should render the room details correctly", () => {
		const { getByText, getByTestId } = render(<RoomOptions />);

		// Assert room name and host text
		expect(getByText("Cool Jazz")).toBeTruthy();
		expect(getByText("John Doe")).toBeTruthy();

		// Assert room image is displayed
		const roomImage = getByTestId("room-image");
		expect(roomImage.props.source.uri).toBe(
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
		);
	});

	it("should navigate to AddSongPage when Add song to queue is pressed", () => {
		const { getByText } = render(<RoomOptions />);

		const addSongButton = getByText("Add song to queue");
		fireEvent.press(addSongButton);

		expect(mockNavigate).toHaveBeenCalledWith("/screens/AddSongPage");
	});

	it("should navigate to RoomInfo screen when Room details button is pressed", () => {
		const { getByText } = render(<RoomOptions />);

		const roomDetailsButton = getByText("Room details");
		fireEvent.press(roomDetailsButton);

		expect(mockNavigate).toHaveBeenCalledWith("/screens/RoomInfo");
	});

	it("should navigate to Playlist screen when Playlist button is pressed", () => {
		const { getByText } = render(<RoomOptions />);

		const playlistButton = getByText("Playlist");
		fireEvent.press(playlistButton);

		expect(mockNavigate).toHaveBeenCalledWith("/screens/rooms/Playlist");
	});

	it("should navigate to Home when Leave Room button is pressed", () => {
		const { getByText } = render(<RoomOptions />);

		const leaveRoomButton = getByText("Leave Room");
		fireEvent.press(leaveRoomButton);

		expect(mockNavigate).toHaveBeenCalledWith("/screens/(tabs)/Home");
	});

	it("should call router.back() when Close button is pressed", () => {
		const { getByText } = render(<RoomOptions />);

		const closeButton = getByText("Close");
		fireEvent.press(closeButton);

		expect(mockBack).toHaveBeenCalled();
	});
});
