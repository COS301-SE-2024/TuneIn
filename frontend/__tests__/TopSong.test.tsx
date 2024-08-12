import React from "react";
import { render } from "@testing-library/react-native";
import TopSong from "../app/components/TopSong"; // Adjust the path as needed

describe("TopSong Component", () => {
	const defaultProps = {
		albumImage: "http://example.com/image.jpg",
		songName: "Song Title",
		plays: 1234,
		songNumber: 1,
	};

	it("renders correctly with given props", () => {
		const { getByText, getByTestId } = render(<TopSong {...defaultProps} />);

		// Check if the song number is displayed
		expect(getByText("1.")).toBeTruthy();

		// Check if the song name is displayed
		expect(getByText("Song Title")).toBeTruthy();

		// Check if the number of plays is displayed
		expect(getByText("1234 plays")).toBeTruthy();

		// Check if the image source URI is correct
		const image = getByTestId("album-image");
		expect(image.props.source.uri).toBe(defaultProps.albumImage);
	});
});
