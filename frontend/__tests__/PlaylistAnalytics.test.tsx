import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PlaylistAnalytics from "../app/screens/analytics/PlaylistAnalytics"; // Adjust the import path as necessary
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("PlaylistAnalytics", () => {
	const routerBack = jest.fn();
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ back: routerBack });
	});

	it("renders correctly", () => {
		const { toJSON } = render(<PlaylistAnalytics />);
		expect(toJSON()).toMatchSnapshot();
	});

	it("calls router.back() when back button is pressed", () => {
		const { getByTestId } = render(<PlaylistAnalytics />);

		// Press the back button using testID
		fireEvent.press(getByTestId("back-button"));

		// Check if router.back() was called
		expect(routerBack).toHaveBeenCalled();
	});

	it("passes the correct data to TopSong", () => {
		const { getByText } = render(<PlaylistAnalytics />);
		// Verify that TopSong component is rendered with correct data
		expect(getByText("Song Performance Analysis")).toBeTruthy();
		expect(getByText("Song 1")).toBeTruthy();
		expect(getByText("Song 2")).toBeTruthy();
		expect(getByText("Song 3")).toBeTruthy();
		expect(getByText("Song 4")).toBeTruthy();
		expect(getByText("Song 5")).toBeTruthy();
	});

	it("passes the correct data to MetricsCard", () => {
		const { getByText } = render(<PlaylistAnalytics />);
		expect(getByText("Total Upvotes")).toBeTruthy();
		expect(getByText("5,461")).toBeTruthy();
		expect(getByText("Total Downvotes")).toBeTruthy();
		expect(getByText("1,567")).toBeTruthy();
	});

	it("passes the correct data to MostDownvotedCard", () => {
		const { getByText } = render(<PlaylistAnalytics />);
		expect(getByText("Song Title")).toBeTruthy();
		expect(getByText("Artist Name")).toBeTruthy();
	});

	it("passes the correct data to HorizontalBarGraphCard", () => {
		const { getByText } = render(<PlaylistAnalytics />);
		expect(getByText("Playlist Saves")).toBeTruthy();
	});

	it("passes the correct data to TableCard", () => {
		const { getByText } = render(<PlaylistAnalytics />);
		expect(getByText("Upvotes vs Downvotes")).toBeTruthy();
		expect(getByText("Song")).toBeTruthy();
		expect(getByText("Upvotes")).toBeTruthy();
		expect(getByText("Downvotes")).toBeTruthy();
		expect(getByText("Song A")).toBeTruthy();
		expect(getByText("654")).toBeTruthy();
		expect(getByText("215")).toBeTruthy();
	});
});
