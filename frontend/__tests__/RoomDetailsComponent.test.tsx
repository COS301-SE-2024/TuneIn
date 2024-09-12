import React from "react";
import { render } from "@testing-library/react-native";
import RoomDetails, {
	RoomDetailsProps,
} from "../app/components/rooms/RoomDetailsComponent";

describe("RoomDetails component", () => {
	it("renders correctly with provided props", () => {
		const props: RoomDetailsProps = {
			image:
				"https://as2.ftcdn.net/v2/jpg/05/72/82/85/1000_F_572828530_ofzCYowQVnlOwkcoBJnZqT36klbJzWdn.jpg",
			name: "Living Room",
			description: "A cozy place to relax and enjoy music.",
			genre: "Electronic",
			language: "English",
			roomSize: "Medium",
			isExplicit: true,
			isNsfw: false,
		};

		const { getByText, queryByText } = render(<RoomDetails {...props} />);

		// Assert room description
		expect(getByText("Room Description")).toBeTruthy();
		expect(getByText(props.description)).toBeTruthy();

		// Assert genre
		expect(getByText("Genre")).toBeTruthy();
		expect(getByText(props.genre)).toBeTruthy();

		// Assert language
		expect(getByText("Language")).toBeTruthy();
		expect(getByText(props.language)).toBeTruthy();

		// Assert explicit tag
		expect(getByText("Explicit")).toBeTruthy();

		// Assert NSFW tag should not be present
		expect(queryByText("NSFW")).toBeNull();
	});

	it("renders correctly when NSFW is true", () => {
		const props: RoomDetailsProps = {
			image:
				"https://as2.ftcdn.net/v2/jpg/05/72/82/85/1000_F_572828530_ofzCYowQVnlOwkcoBJnZqT36klbJzWdn.jpg",
			name: "Private Room",
			description: "A private room with restricted content.",
			genre: "Adult",
			language: "English",
			roomSize: "Small",
			isExplicit: true,
			isNsfw: true,
		};

		const { getByText } = render(<RoomDetails {...props} />);

		// Assert NSFW tag when isNsfw is true
		expect(getByText("NSFW")).toBeTruthy();
	});
});
