import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProfileCard, {
	ProfileCardProps,
} from "../../app/components/messaging/profileCard"; // Adjust the import path as necessary
import { UserDto } from "../../app/models/UserDto"; // Adjust the import path as necessary

describe("ProfileCard", () => {
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

	const mockSelect = jest.fn();

	const renderComponent = (props: Partial<ProfileCardProps> = {}) => {
		return render(
			<ProfileCard
				otherUser={{ ...mockUser }}
				isSelected={false}
				select={mockSelect}
				{...props}
			/>,
		);
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("applies selected styles when isSelected is true", () => {
		const { getByTestId } = renderComponent({ isSelected: true });

		const container = getByTestId("chat-item-touchable");
		const avatar = getByTestId("chat-item-avatar");

		// Ensure specific properties exist in the style object
		expect(container.props.style).toEqual(
			expect.objectContaining({
				backgroundColor: expect.any(String), // This ensures that background color is present
			}),
		);

		// Check for border color when selected
		expect(avatar.props.style).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ borderColor: "#08BDBD" }), // Adjust with actual color value
			]),
		);
	});

	test("applies selected styles when isSelected is true", () => {
		const { getByTestId } = renderComponent({ isSelected: true });

		const container = getByTestId("chat-item-touchable");

		// Check for specific styles in the received style object
		expect(container.props.style).toEqual(
			expect.objectContaining({
				backgroundColor: expect.any(String), // Adjust according to your background color logic
				borderColor: "#08BDBD", // Adjust with actual color value
			}),
		);
	});

	test("does not apply selected styles when isSelected is false", () => {
		const { getByTestId } = renderComponent({ isSelected: false });

		const avatar = getByTestId("chat-item-avatar");

		// Check if the selected style is not applied (you may need to adjust based on actual styles)
		expect(avatar.props.style).not.toContainEqual(
			expect.objectContaining({ borderColor: "#08BDBD" }),
		);
	});
});
