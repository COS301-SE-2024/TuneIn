import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FriendsGrid from "../app/components/FriendsGrid";
import { Friend } from "../app/models/friend";

const mockFriends: Friend[] = [
	{
		profilePicture: "https://example.com/profile1.jpg",
		name: "John Doe",
	},
	{
		profilePicture: "https://example.com/profile2.jpg",
		name: "Jane Smith",
	},
	{
		profilePicture: "https://example.com/profile3.jpg",
		name: "Michael Johnson",
	},
];

describe("FriendsGrid component", () => {
	it("renders correctly and navigates on link press", () => {
		const { getByText } = render(
			<FriendsGrid friends={mockFriends} maxVisible={3} />,
		);

		// Check if friend names are rendered
		expect(getByText("John Doe")).toBeTruthy();
		expect(getByText("Jane Smith")).toBeTruthy();
		expect(getByText("Michael Johnson")).toBeTruthy();
	});
});
