import React from "react";
import { render } from "@testing-library/react-native";
import MessageItem from "../../app/components/MessageItem"; // Adjust the import path as necessary
import { DirectMessage } from "../../app/hooks/useDMControls"; // Adjust import path if needed

// Sample data for the tests
const mockMessageFromMe: DirectMessage = {
	message: {
		index: 1,
		messageBody: "Hello from me!",
		sender: {
			userID: "user1",
			username: "User 1",
			profile_picture_url: "https://example.com/my-avatar.jpg",
		},
		recipient: {
			userID: "user2",
			username: "User 2",
		},
		dateSent: new Date().toISOString(),
		dateRead: new Date(0).toISOString(),
		isRead: false,
		pID: "",
		bodyIsRoomID: false,
	},
	me: true,
	messageSent: true,
	isOptimistic: false,
};
// Create a mock message for testing
const mockMessageFromOther: DirectMessage = {
	me: false,
	message: {
		index: 0,
		messageBody: "Hello from you!",
		sender: {
			username: "User 2",
			profile_picture_url: "https://example.com/other-avatar.jpg",
		},
		recipient: {
			username: "User 1",
			profile_picture_url: "https://example.com/my-avatar.jpg",
		},
		dateSent: new Date().toISOString(),
		dateRead: new Date(0).toISOString(),
		isRead: false,
		pID: "",
		bodyIsRoomID: false,
	},
};

it("renders my message correctly", () => {
	const { getByText } = render(<MessageItem message={mockMessageFromMe} />);

	// Check if my message is rendered
	expect(getByText("Hello from me!")).toBeTruthy();
});

it("renders another user's message correctly", () => {
	const { getByText, getByLabelText } = render(
		<MessageItem message={mockMessageFromOther} />,
	);

	// Check if the other user's message is rendered
	expect(getByText("Hello from you!")).toBeTruthy();

	// Check if the avatar is displayed by accessibility label
	const avatar = getByLabelText("User 2's avatar");
	expect(avatar).toBeTruthy(); // Check that the image is rendered

	// Optionally, check the image source directly
	expect(avatar.props.source.uri).toBe("https://example.com/other-avatar.jpg");
});
