import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GeneralAnalytics from "../app/screens/analytics/GeneralAnalytics";
import { useRouter } from "expo-router";

// Mock the useRouter hook from 'expo-router'
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// // Inline mock components
// const LineGraphCard = ({ title }) => <>{title}</>;
// const HorizontalBarGraphCard = ({ title }) => <>{title}</>;
// const TableCard = ({ title }) => <>{title}</>;

// Mocking the actual components
// jest.mock("../../components/LineGraphCard", () => LineGraphCard);
// jest.mock(
// 	"../../components/HorizontalBarGraphCard",
// 	() => HorizontalBarGraphCard,
// );
// jest.mock("../../components/TableCard", () => TableCard);

describe("GeneralAnalytics", () => {
	// Set up the mock useRouter function
	const routerBack = jest.fn();
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ back: routerBack });
	});

	it("renders correctly", () => {
		const { getByText } = render(<GeneralAnalytics />);

		// Check if the header title is rendered
		expect(getByText("General and Room Analytics")).toBeTruthy();

		// Check if the LineGraphCard, HorizontalBarGraphCard, and TableCard components are rendered
		expect(getByText("Weekly Participants")).toBeTruthy();
		expect(getByText("Room Popularity by Clicks")).toBeTruthy();
		expect(getByText("Average Session Duration")).toBeTruthy();
		expect(getByText("Session Duration Extremes")).toBeTruthy();
	});

	it("calls router.back() when back button is pressed", () => {
		const { getByTestId } = render(<GeneralAnalytics />);

		// Press the back button using testID
		fireEvent.press(getByTestId("back-button"));

		// Check if router.back() was called
		expect(routerBack).toHaveBeenCalled();
	});

	// Add more tests to check if LineGraphCard, HorizontalBarGraphCard, and TableCard are receiving props correctly
	it("passes the correct data to LineGraphCard", () => {
		const { getByText } = render(<GeneralAnalytics />);

		// Check if LineGraphCard is rendered with the correct title
		expect(getByText("Weekly Participants")).toBeTruthy();
	});

	it("passes the correct data to HorizontalBarGraphCard", () => {
		const { getByText } = render(<GeneralAnalytics />);

		// Check if HorizontalBarGraphCard is rendered with the correct title
		expect(getByText("Room Popularity by Clicks")).toBeTruthy();
		expect(getByText("Average Session Duration")).toBeTruthy();
	});

	it("passes the correct data to TableCard", () => {
		const { getByText } = render(<GeneralAnalytics />);

		// Check if TableCard is rendered with the correct title
		expect(getByText("Session Duration Extremes")).toBeTruthy();
	});
});
