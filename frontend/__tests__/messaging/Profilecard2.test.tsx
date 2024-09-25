import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProfileCard, {
	ProfileCardProps,
} from "../../app/screens/messaging/profileCard"; // Adjust the path accordingly
import { UserDto } from "../../app/models/UserDto"; // Adjust the path accordingly
import { colors } from "../../app/styles/colors";

const mockUser: UserDto = {
	profile_name: "John Doe",
	userID: "123",
	username: "johndoe",
	profile_picture_url: "https://example.com/avatar.jpg",
	followers: { count: 0, data: [] },
	following: { count: 0, data: [] },
	links: { count: 0, data: [] },
	bio: "Hello, I am John!",
	current_song: {
		title: "Some Song",
		artists: ["Artist Name"],
		cover: "https://example.com/song-cover.jpg",
		start_time: new Date(),
	},
	fav_genres: { count: 0, data: [] },
	fav_songs: { count: 0, data: [] },
	fav_rooms: { count: 0, data: [] },
	recent_rooms: { count: 0, data: [] },
};

describe("ProfileCard Component", () => {
	const selectMock = jest.fn();

	it("renders correctly", () => {
		const { getByTestId, getByText } = render(
			<ProfileCard
				otherUser={mockUser}
				isSelected={false}
				select={selectMock}
			/>,
		);

		expect(getByTestId("chat-item-touchable")).toBeTruthy();
		expect(getByTestId("chat-item-avatar")).toBeTruthy();
		expect(getByText(mockUser.profile_name)).toBeTruthy();
	});

	it("calls select function when pressed", () => {
		const { getByTestId } = render(
			<ProfileCard
				otherUser={mockUser}
				isSelected={false}
				select={selectMock}
			/>,
		);

		const touchable = getByTestId("chat-item-touchable");
		fireEvent.press(touchable);

		expect(selectMock).toHaveBeenCalled();
	});

	it("applies selected styles when isSelected is true", () => {
		const { getByTestId } = render(
			<ProfileCard
				otherUser={mockUser}
				isSelected={true}
				select={selectMock}
			/>,
		);

		const avatar = getByTestId("chat-item-avatar");

		expect(avatar.props.style).toContainEqual(
			expect.objectContaining({ borderColor: colors.primary }),
		);
	});
});
