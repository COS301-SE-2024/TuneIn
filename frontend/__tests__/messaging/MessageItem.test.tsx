import React from "react";
import { render } from "@testing-library/react-native";
import MessageItem from "../../app/components/messaging/MessageItem";
import { DirectMessage } from "../../app/services/Live";

// Mock the RoomLink component
jest.mock("../../app/components/messaging/RoomLink", () => "RoomLink");

describe("MessageItem", () => {
	const mockMessage: DirectMessage = {
		message: {
			messageBody: "Hello, world!",
			sender: {
				profile_picture_url: "http://example.com/profile.jpg",
				profile_name: "",
				userID: "",
				username: "",
				followers: {
					count: 0,
					data: [],
				},
				following: {
					count: 0,
					data: [],
				},
				links: {
					count: 0,
					data: [],
				},
				bio: "",
				current_song: {
					title: "",
					artists: [],
					cover: "",
					start_time: new Date(), // Initialize with a valid Date object
				},
				fav_genres: {
					count: 0,
					data: [],
				},
				fav_songs: {
					count: 0,
					data: [],
				},
				fav_rooms: {
					count: 0,
					data: [],
				},
				recent_rooms: {
					count: 0,
					data: [],
				},
			},
			room: undefined,
			index: 0,
			recipient: {
				profile_name: "",
				userID: "",
				username: "",
				profile_picture_url: "",
				followers: {
					count: 0,
					data: [],
				},
				following: {
					count: 0,
					data: [],
				},
				links: {
					count: 0,
					data: [],
				},
				bio: "",
				current_song: {
					title: "",
					artists: [],
					cover: "",
					start_time: new Date(),
				},
				fav_genres: {
					count: 0,
					data: [],
				},
				fav_songs: {
					count: 0,
					data: [],
				},
				fav_rooms: {
					count: 0,
					data: [],
				},
				recent_rooms: {
					count: 0,
					data: [],
				},
				friendship: undefined,
			},
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "",
		},
		messageSent: false,
	};

	it("renders message body correctly", () => {
		const { getByText } = render(<MessageItem message={mockMessage} />);
		expect(getByText("Hello, world!")).toBeTruthy();
	});

	it("renders profile picture when message is from another user", () => {
		const { getByTestId } = render(<MessageItem message={mockMessage} />);
		expect(getByTestId("profile-pic")).toBeTruthy();
	});

	it("does not render profile picture when message is from the current user", () => {
		const messageFromMe = {
			...mockMessage,
			message: {
				...mockMessage.message,
				messageSent: true,
				sender: { ...mockMessage.message.sender, profile_picture_url: "" }, // Ensure this does not render
			},
		};
		const { queryByTestId } = render(<MessageItem message={messageFromMe} />);
		expect(queryByTestId("profile-pic")).toBeNull();
	});
});
