import React from "react";
import { render } from "@testing-library/react-native";
import CommentWidget from "../../app/components/CommentWidget"; // Adjust the import path as necessary

describe("CommentWidget", () => {
	it("renders correctly with given props", () => {
		const { getByText, getByTestId } = render(
			<CommentWidget
				username="John Doe"
				message="This is a comment."
				profilePictureUrl="https://example.com/profile.jpg"
				me={true}
			/>,
		);

		// Check if the username and message are rendered correctly
		expect(getByText("John Doe")).toBeTruthy();
		expect(getByText("This is a comment.")).toBeTruthy();
		// Check if the profile picture URL is correct
		expect(getByTestId("comment-widget-avatar").props.source.uri).toBe(
			"https://example.com/profile.jpg",
		);
	});

	it("applies correct styles for 'me' prop", () => {
		const { getByTestId } = render(
			<CommentWidget
				username="John Doe"
				message="This is a comment."
				profilePictureUrl="https://example.com/profile.jpg"
				me={true}
			/>,
		);

		const container = getByTestId("comment-widget-container");
		const bubble = getByTestId("comment-widget-bubble");

		// Check if container has style for 'me'
		expect(container.props.style).toContainEqual(
			expect.objectContaining({
				justifyContent: "flex-start",
			}),
		);
		expect(bubble.props.style).toContainEqual(
			expect.objectContaining({
				backgroundColor: "#08bdbd",
				alignSelf: "flex-start",
			}),
		);
	});

	it("applies correct styles for 'other' prop", () => {
		const { getByTestId } = render(
			<CommentWidget
				username="Jane Doe"
				message="Another comment."
				profilePictureUrl="https://example.com/profile.jpg"
				me={false}
			/>,
		);

		const container = getByTestId("comment-widget-container");
		const bubble = getByTestId("comment-widget-bubble");

		// Check if container has style for 'other'
		expect(container.props.style).toContainEqual(
			expect.objectContaining({
				justifyContent: "flex-start",
			}),
		);
		expect(bubble.props.style).toContainEqual(
			expect.objectContaining({
				backgroundColor: "#FFFFFF",
				alignSelf: "flex-start",
				borderColor: "#ECECEC",
				borderWidth: 1,
			}),
		);
	});
});
