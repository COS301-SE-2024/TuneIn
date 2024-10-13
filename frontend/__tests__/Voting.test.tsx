// Voting.test.tsx

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Voting from "../app/components/Voting";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

describe("Voting Component", () => {
	const mockSetVoteCount = jest.fn();
	const mockSwapSongs = jest.fn();

	const renderComponent = (voteCount = 0) => {
		return render(
			<Voting
				voteCount={voteCount}
				setVoteCount={mockSetVoteCount}
				index={0}
				swapSongs={mockSwapSongs}
			/>,
		);
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders vote count correctly", () => {
		const { getByText } = renderComponent(5);
		expect(getByText("5")).toBeTruthy();
	});

	it("handles upvote correctly", () => {
		const { getByTestId } = renderComponent(5);

		fireEvent.press(getByTestId("upvote-button"));

		// Simulate the function call for the state update
		const updateFunction = mockSetVoteCount.mock.calls[0][0];
		expect(updateFunction(5)).toBe(6);
		expect(mockSetVoteCount).toHaveBeenCalledWith(expect.any(Function), 0);
		expect(mockSwapSongs).toHaveBeenCalledWith(0, "up");
	});

	it("handles downvote correctly", () => {
		const { getByTestId } = renderComponent(5);

		fireEvent.press(getByTestId("downvote-button"));

		// Simulate the function call for the state update
		const updateFunction = mockSetVoteCount.mock.calls[0][0];
		expect(updateFunction(5)).toBe(4);
		expect(mockSetVoteCount).toHaveBeenCalledWith(expect.any(Function), 0);
		expect(mockSwapSongs).toHaveBeenCalledWith(0, "down");
	});

	it("disables upvote if already upvoted", () => {
		const { getByTestId } = renderComponent(5);

		fireEvent.press(getByTestId("upvote-button")); // First upvote
		fireEvent.press(getByTestId("upvote-button")); // Attempt second upvote

		expect(mockSetVoteCount).toHaveBeenCalledTimes(1);
	});

	it("disables downvote if already downvoted", () => {
		const { getByTestId } = renderComponent(5);

		fireEvent.press(getByTestId("downvote-button")); // First downvote
		fireEvent.press(getByTestId("downvote-button")); // Attempt second downvote

		expect(mockSetVoteCount).toHaveBeenCalledTimes(1);
	});

	it("toggles upvote and downvote correctly", () => {
		const { getByTestId } = renderComponent(5);

		fireEvent.press(getByTestId("upvote-button")); // Upvote
		fireEvent.press(getByTestId("downvote-button")); // Downvote

		expect(mockSetVoteCount).toHaveBeenCalledTimes(2);
		expect(mockSwapSongs).toHaveBeenCalledWith(0, "up");
		expect(mockSwapSongs).toHaveBeenCalledWith(0, "down");

		// Simulate the function calls for the state updates
		const upvoteFunction = mockSetVoteCount.mock.calls[0][0];
		const downvoteFunction = mockSetVoteCount.mock.calls[1][0];
		expect(upvoteFunction(5)).toBe(6);
		expect(downvoteFunction(6)).toBe(5);
	});
});
