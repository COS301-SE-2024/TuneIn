import React from "react";
import FriendCard from "../../app/components/FriendCard";
import { Friend } from "../../app/models/friend"; // Adjust the import path as needed
import { render, screen } from "@testing-library/react-native";

const mockFriend: Friend = {
	profile_picture_url: "https://example.com/profile.jpg",
	username: "Test User",
};

describe("FriendCard", () => {
	const user = "testUser";

	it("renders correctly with given props", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
			/>,
		);

		// Check if the profile picture image is rendered
		const image = screen.getByTestId("friend-card-image");
		expect(image.props.source).toEqual({ uri: mockFriend.profile_picture_url });

		// Check if the username text is rendered
		const usernameText = screen.getByText(mockFriend.username);
		expect(usernameText).not.toBeNull();
	});

	it("navigates to the correct link when pressed", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
			/>,
		);

		// Check if the Link component has the correct href attribute
		const linkElement = screen.getByTestId("friend-card-link");
		expect(linkElement.props.href).toBe(
			`/screens/profile/ProfilePage?friend=${JSON.stringify(
				mockFriend,
			)}&user=${user}`,
		);
	});
});
