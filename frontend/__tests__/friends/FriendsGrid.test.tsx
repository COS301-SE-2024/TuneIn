import React from "react";
import FriendsGrid from "../../app/components/FriendsGrid";
import { Friend } from "../../app/models/friend";
import { render, screen } from "@testing-library/react-native";

const mockFriends: Friend[] = [
	{
		profile_picture_url: "https://example.com/profile1.jpg",
		username: "User1",
	},
	{
		profile_picture_url: "https://example.com/profile2.jpg",
		username: "User2",
	},
];

describe("FriendsGrid", () => {
	const user = "testUser";

	it("renders the correct profile images and usernames", () => {
		render(<FriendsGrid friends={mockFriends} user={user} maxVisible={2} />);

		// Check for User1
		const image1 = screen.getByTestId("friend-profile-image-User1");
		expect(image1.props.source.uri).toBe(mockFriends[0].profile_picture_url);

		const name1 = screen.getByTestId("friend-name-User1");
		expect(name1.props.children).toBe(mockFriends[0].username);

		// Check for User2
		const image2 = screen.getByTestId("friend-profile-image-User2");
		expect(image2.props.source.uri).toBe(mockFriends[1].profile_picture_url);

		const name2 = screen.getByTestId("friend-name-User2");
		expect(name2.props.children).toBe(mockFriends[1].username);
	});
});
