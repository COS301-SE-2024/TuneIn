import React from "react";
import { render } from "@testing-library/react-native";
import DrawerNavigator from "../app/components/DrawerNavigator"; // Adjust the path as necessary
// import { NavigationContainer } from "@react-navigation/native";
// import { createDrawerNavigator } from "@react-navigation/drawer";

jest.mock("@react-navigation/native", () => {
	const actualNav = jest.requireActual("@react-navigation/native");
	return {
		...actualNav,
		NavigationContainer: ({ children }) => <>{children}</>,
	};
});

jest.mock("@react-navigation/drawer", () => {
	return {
		createDrawerNavigator: jest.fn().mockReturnValue({
			Navigator: ({ children }) => <>{children}</>,
			Screen: ({ children }) => <>{children}</>,
		}),
	};
});

describe("DrawerNavigator", () => {
	it("renders correctly", () => {
		const { getByTestId } = render(<DrawerNavigator />);

		// Check if the drawer navigator container is rendered
		expect(getByTestId("drawer-navigator-container")).toBeTruthy();
	});

	// it("contains all the necessary screens", () => {
	// 	const { getByText } = render(<DrawerNavigator />);

	// 	// Check for the presence of screen names
	// 	expect(getByText("AnalyticsPage")).toBeTruthy();
	// 	expect(getByText("InteractionsAnalytics")).toBeTruthy();
	// 	expect(getByText("GeneralAnalytics")).toBeTruthy();
	// 	expect(getByText("PlaylistAnalytics")).toBeTruthy();
	// });
});
