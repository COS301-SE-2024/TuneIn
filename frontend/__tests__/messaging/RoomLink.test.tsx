import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoomLink from "../../app/components/messaging/RoomLink";
import { Room } from "../../app/models/Room";
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("RoomLink", () => {
	const mockRouter = {
		push: jest.fn(),
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	const mockRoom: Room = {
		roomID: "1",
		name: "Sample Room",
		description: "This is a sample room.",
		backgroundImage: "http://example.com/background.jpg",
		userProfile: "http://example.com/profile.jpg",
		username: "Sample User",
		genre: "Rock",
		isExplicit: true,
		isNsfw: false,
		userID: "selfID", // Add missing property
		tags: [], // Add missing property
	};

	it("renders the component correctly", () => {
		const { getByText, getByTestId } = render(<RoomLink room={mockRoom} />);

		expect(getByText("Sample User")).toBeTruthy();
		expect(getByText("Sample Room")).toBeTruthy();
		expect(getByText("This is a sample room.")).toBeTruthy();
		expect(getByText("Rock")).toBeTruthy();
		expect(getByTestId("Image")).toBeTruthy();
	});

	it("navigates to the room page when pressed", () => {
		const { getByTestId } = render(<RoomLink room={mockRoom} />);

		fireEvent.press(getByTestId("card"));
		expect(mockRouter.push).toHaveBeenCalledWith({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(mockRoom) },
		});
	});
});
