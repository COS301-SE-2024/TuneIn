import React from "react";
import { render } from "@testing-library/react-native";
import MostDownvotedCard from "../app/components/MostDownvotedCard"; // Adjust the path as needed

describe("MostDownvotedCard Component", () => {
	const defaultProps = {
		albumImage: "http://example.com/image.jpg",
		songName: "Downvoted Song Title",
		artistName: "Artist Name",
	};

	it("renders correctly with given props", () => {
		const { getByText, getByTestId } = render(
			<MostDownvotedCard {...defaultProps} />,
		);

		// Check if the header text is displayed
		expect(getByText("Most Downvoted Song")).toBeTruthy();

		// Check if the song name is displayed
		expect(getByText("Downvoted Song Title")).toBeTruthy();

		// Check if the artist name is displayed
		expect(getByText("Artist Name")).toBeTruthy();

		// Check if the image source URI is correct
		const image = getByTestId("album-image");
		expect(image.props.source.uri).toBe(defaultProps.albumImage);
	});
});
