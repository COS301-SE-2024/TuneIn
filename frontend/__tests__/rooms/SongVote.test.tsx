import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SongVote from "../../app/components/rooms/SongVote"; // Adjust the import path as needed

describe("SongVote Component", () => {
	const setVoteCount = jest.fn();
	const swapSongs = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render correctly", () => {
		const { getByTestId, getByText } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		expect(getByText("10")).toBeTruthy();
		expect(getByTestId("upvote-button")).toBeTruthy();
		expect(getByTestId("downvote-button")).toBeTruthy();
	});

	it("should handle upvote correctly", () => {
		const { getByTestId } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		fireEvent.press(getByTestId("upvote-button"));

		// Verify vote count increment and the swapSongs call
		expect(setVoteCount).toHaveBeenCalledWith(11);
		expect(swapSongs).toHaveBeenCalledWith(0, "up");
	});

	it("should handle downvote correctly", () => {
		const { getByTestId } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		fireEvent.press(getByTestId("downvote-button"));

		// Verify vote count decrement and the swapSongs call
		expect(setVoteCount).toHaveBeenCalledWith(9);
		expect(swapSongs).toHaveBeenCalledWith(0, "down");
	});

	it("should handle upvote removal correctly", () => {
		const { getByTestId } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		fireEvent.press(getByTestId("upvote-button")); // First upvote
		fireEvent.press(getByTestId("upvote-button")); // Remove upvote

		// Verify vote count decrement and the swapSongs call
		expect(setVoteCount).toHaveBeenCalledWith(10);
		expect(swapSongs).toHaveBeenCalledWith(0, "up");
	});

	it("should handle downvote removal correctly", () => {
		const { getByTestId } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		fireEvent.press(getByTestId("downvote-button")); // First downvote
		fireEvent.press(getByTestId("downvote-button")); // Remove downvote

		// Verify vote count increment and the swapSongs call
		expect(setVoteCount).toHaveBeenCalledWith(10);
		expect(swapSongs).toHaveBeenCalledWith(0, "down");
	});

	it("should handle changing from downvote to upvote correctly", () => {
		const { getByTestId } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		fireEvent.press(getByTestId("downvote-button")); // First downvote
		fireEvent.press(getByTestId("upvote-button")); // Change to upvote

		// Verify vote count adjustment and the swapSongs call
		expect(setVoteCount).toHaveBeenCalledWith(11);
		expect(swapSongs).toHaveBeenCalledWith(0, "up");
	});

	it("should handle changing from upvote to downvote correctly", () => {
		const { getByTestId } = render(
			<SongVote
				voteCount={10}
				setVoteCount={setVoteCount}
				index={0}
				swapSongs={swapSongs}
			/>,
		);

		fireEvent.press(getByTestId("upvote-button")); // First upvote
		fireEvent.press(getByTestId("downvote-button")); // Change to downvote

		// Verify vote count adjustment and the swapSongs call
		expect(setVoteCount).toHaveBeenCalledWith(9);
		expect(swapSongs).toHaveBeenCalledWith(0, "down");
	});
});
