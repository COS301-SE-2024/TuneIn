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

	it("handles drawer toggle", () => {
		const { getByTestId, getByText } = render(<AnalyticsPage />);

		// Initially, drawer should not be visible
		expect(() => getByText("General Analytics")).toThrow();

		// Toggle drawer
		fireEvent.press(getByTestId("menu-button"));

		// Check if the drawer content is now visible
		expect(getByText("General Analytics")).toBeTruthy();
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

	// it("changes button styles when pressed", () => {
	// 	const { getByText } = render(<AnalyticsPage />);

	// 	// Check initial button styles
	// 	const dayButton = getByText("Day").parent;
	// 	expect(dayButton).toHaveStyle({ backgroundColor: "white" });

	// 	// Press "Day" button to activate it
	// 	fireEvent.press(dayButton);

	// 	// Check if the button style is active
	// 	expect(dayButton).toHaveStyle({ backgroundColor: colors.primary });
	// });

	it("calls router.back() when back button is pressed", () => {
		const { getByTestId } = render(<AnalyticsPage />);

		// Press back button
		fireEvent.press(getByTestId("back-button"));

		// Check if router.back() was called
		expect(routerBack).toHaveBeenCalled();
	});
});
