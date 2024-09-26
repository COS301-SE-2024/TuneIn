import React from "react";
import { render } from "@testing-library/react-native";
import RoomDetails, {
	RoomDetailsProps,
} from "../app/components/rooms/RoomDetailsComponent";
import { Room } from "../app/models/Room"; // Adjust path based on your project structure

describe("RoomDetails component", () => {
	it("renders correctly with provided props", () => {
		const props: RoomDetailsProps = {
			room: {
				roomID: "1",
				backgroundImage:
					"https://as2.ftcdn.net/v2/jpg/05/72/82/85/1000_F_572828530_ofzCYowQVnlOwkcoBJnZqT36klbJzWdn.jpg",
				name: "Living Room",
				description: "A cozy place to relax and enjoy music.",
				genre: "Electronic",
				language: "English",
				tags: [],
				isExplicit: true,
				userID: "Test-User",
				isNsfw: false,
				start_date: new Date(),
				end_date: new Date(),
			},
		};

		const { getByText, queryByText } = render(<RoomDetails {...props} />);

		// Assert room description
		expect(getByText("Room Description")).toBeTruthy();
		expect(getByText(props.room.description!)).toBeTruthy(); // Use non-null assertion

		// Assert genre
		expect(getByText("Genre")).toBeTruthy();
		expect(getByText(props.room.genre!)).toBeTruthy(); // Use non-null assertion

		// Assert language
		expect(getByText("Language")).toBeTruthy();
		expect(getByText(props.room.language!)).toBeTruthy(); // Use non-null assertion

		// Assert explicit tag
		expect(getByText("Explicit")).toBeTruthy();

		// Assert NSFW tag should not be present
		expect(queryByText("NSFW")).toBeNull();
	});

	it("renders correctly when NSFW is true", () => {
		const props: RoomDetailsProps = {
			room: {
				roomID: "2",
				backgroundImage:
					"https://as2.ftcdn.net/v2/jpg/05/72/82/85/1000_F_572828530_ofzCYowQVnlOwkcoBJnZqT36klbJzWdn.jpg",
				name: "Private Room",
				description: "A private room with restricted content.",
				genre: "Adult",
				language: "English",
				tags: [],
				isExplicit: true,
				userID: "Test-User2",
				isNsfw: true,
				start_date: new Date(),
				end_date: new Date(),
			},
		};

		const { getByText } = render(<RoomDetails {...props} />);

		// Assert NSFW tag when isNsfw is true
		expect(getByText("NSFW")).toBeTruthy();
	});
});
