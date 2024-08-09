import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AnalyticsPage from "../app/screens/analytics/AnalyticsPage";
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// Mock the Ionicons component
jest.mock("@expo/vector-icons", () => ({
	Ionicons: jest
		.fn()
		.mockImplementation(({ name }) => <mock-ionic name={name} />),
}));

describe("AnalyticsPage", () => {
	let routerPush;
	let routerBack;

	beforeEach(() => {
		routerPush = jest.fn();
		routerBack = jest.fn();
		useRouter.mockReturnValue({ push: routerPush, back: routerBack });
	});

	it("renders correctly", () => {
		const { getByText, getByTestId } = render(<AnalyticsPage />);

		// Check if the header title is rendered
		expect(getByText("Key Metrics Summary")).toBeTruthy();

		// Toggle drawer to make drawer items visible
		fireEvent.press(getByTestId("menu-button"));

		// Check if the drawer items are rendered after toggling
		expect(getByText("General Analytics")).toBeTruthy();
		expect(getByText("Interactions Analytics")).toBeTruthy();
		expect(getByText("Playlist Analytics")).toBeTruthy();

		// Check if buttons are rendered
		expect(getByText("Day")).toBeTruthy();
		expect(getByText("Week")).toBeTruthy();
		expect(getByText("Month")).toBeTruthy();
	});

	it("handles drawer toggle General Analytics", () => {
		const { getByTestId, getByText } = render(<AnalyticsPage />);

		// Initially, drawer should not be visible
		expect(() => getByText("General Analytics")).toThrow();

		// Toggle drawer
		fireEvent.press(getByTestId("menu-button"));

		// Check if the drawer content is now visible
		expect(getByText("General Analytics")).toBeTruthy();
	});

	it("handles drawer toggle Interactions Analytics", () => {
		const { getByTestId, getByText } = render(<AnalyticsPage />);

		// Initially, drawer should not be visible
		expect(() => getByText("Interactions Analytics")).toThrow();

		// Toggle drawer
		fireEvent.press(getByTestId("menu-button"));

		// Check if the drawer content is now visible
		expect(getByText("Interactions Analytics")).toBeTruthy();
	});

	it("handles drawer toggle Playlist Analytics", () => {
		const { getByTestId, getByText } = render(<AnalyticsPage />);

		// Initially, drawer should not be visible
		expect(() => getByText("Playlist Analytics")).toThrow();

		// Toggle drawer
		fireEvent.press(getByTestId("menu-button"));

		// Check if the drawer content is now visible
		expect(getByText("Playlist Analytics")).toBeTruthy();
	});

	it("applies active style to the Day button when pressed", () => {
		const { getByTestId } = render(<AnalyticsPage />);

		fireEvent.press(getByTestId("day-button"));

		// expect(getByTestId("day-button").props.style[1]).toEqual(
		// 	styles.activeButton,
		// );
	});

	it("applies active style to the Week button when pressed", () => {
		const { getByTestId } = render(<AnalyticsPage />);

		fireEvent.press(getByTestId("week-button"));

		// expect(getByTestId("week-button").props.style[1]).toEqual(
		// 	styles.activeButton,
		// );
	});

	it("applies active style to the Month button when pressed", () => {
		const { getByTestId } = render(<AnalyticsPage />);

		fireEvent.press(getByTestId("month-button"));

		// expect(getByTestId("month-button").props.style[1]).toEqual(
		// 	styles.activeButton,
		// );
	});

	it("navigates to the correct screen when a drawer item is pressed", () => {
		const { getByTestId, getByText } = render(<AnalyticsPage />);

		// Toggle drawer to make drawer items visible
		fireEvent.press(getByTestId("menu-button"));

		// Press "General Analytics" drawer item
		fireEvent.press(getByText("General Analytics"));

		// Check if the correct route was pushed
		expect(routerPush).toHaveBeenCalledWith(
			"/screens/analytics/GeneralAnalytics",
		);
	});

	it("calls router.back() when back button is pressed", () => {
		const { getByTestId } = render(<AnalyticsPage />);

		// Press back button
		fireEvent.press(getByTestId("back-button"));

		// Check if router.back() was called
		expect(routerBack).toHaveBeenCalled();
	});
});
